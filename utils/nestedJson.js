
const { saveToPlanMap, saveToPlanSet, retriveKeyType, getPlan } = require('../dao/planDAO');
const utils = require('../dao/planDAO')
const ErrorResponse = require('../utils//errorResponse');

/**
 *
 * @param {string} planId
 * @param {Object} planJson
 * @returns {boolean}
 */
const nestedJson = async (planId, planJson) => {
  try {
    //iterate over all keys of planJson
    for (let eachKey in planJson) {
      //check whether the key is present in our planJson
      if (planJson.hasOwnProperty(eachKey)) {
        //if it is present extract the data stored in that key
        let valueThatKeyHolds = planJson[eachKey];
        //if the data extracted is a object(it might be array,object.....etc)
        if (typeof valueThatKeyHolds == 'object') {
          if (valueThatKeyHolds instanceof Array) {
            //entering here when the valueThatKeyHolds is an array
            let relationShipKey = planId + '_' + eachKey
            //save it in db hashMap
            await saveToPlanMap(planId, eachKey, relationShipKey);
            //since it the valueThatKeyHolds is a array we can iterate over each array element to reach
            //destination node
            for (let i = 0; i < valueThatKeyHolds.length; i++) {    //check if each element is object because of
              if (typeof valueThatKeyHolds[i] == 'object') {
                //each element inside array id
                let arrayInnerObjectId = planId + "_" + valueThatKeyHolds[i].objectType + "_" + valueThatKeyHolds[i].objectId;
                //add this to set with one key because array elements will can have more than one value
                await saveToPlanSet(relationShipKey, arrayInnerObjectId)
                //this array might have objects inside it call once again to parse and save
                nestedJson(arrayInnerObjectId, valueThatKeyHolds[i]);
              } else {
                await saveToPlanSet(relationShipKey, valueThatKeyHolds[i])
              }
            }
          }
          else {
            //independently present object with key value in a Json not inside a array(this is not a instanceOf array)
            let compositeObjectId = planId + "_" + valueThatKeyHolds.objectType + "_" + valueThatKeyHolds.objectId
            await saveToPlanMap(planId, eachKey, compositeObjectId);
            nestedJson(compositeObjectId, valueThatKeyHolds);
          }
        }
        else {
          //simple properties map
          await saveToPlanMap(planId, eachKey, valueThatKeyHolds);
        }

      }
    }
    return true;
  } catch (error) {
    return error;
  }
}

/**
 *
 * @param {string} planId
 * @param {Object} planJson
 * @returns {boolean}
 */
const recreateJSON = async (planId, planJson) => {
  try {
    //retrieve the type of key to check whether its value is a hash or a key
    const keyType = await retriveKeyType(planId);
    if (keyType == 'hash') {
      //entering this if the key value stored against it is hash
      const mapStorage = await getPlan(planId)
      //iterate over the map keys to rejoin it
      for (let key in mapStorage) {
        let valueAssociatedWithEachkey = mapStorage[key];
        let currentIterativeKey = key;
        //this valueAssociatedWithEachkey may be a hash or a set based on the nested structure
        const nestedKeyType = await retriveKeyType(valueAssociatedWithEachkey);
        if (nestedKeyType == 'hash') {
          //if the nestedKeyType has a hash map as value the reformed json will have object
          let newHashJson = {};
          planJson[currentIterativeKey] = newHashJson;
          await recreateJSON(valueAssociatedWithEachkey, newHashJson);
        } else if (nestedKeyType == 'set') {
          //if the nestedKeyType has set then the key will have array as the value
          let newJsonArr = [];
          planJson[currentIterativeKey] = newJsonArr;
          await recreateJSON(valueAssociatedWithEachkey, newJsonArr);
        } else {
          //for simpleproperties may have number or string
          planJson[currentIterativeKey] = isNaN(valueAssociatedWithEachkey) ? valueAssociatedWithEachkey : parseInt(valueAssociatedWithEachkey)
        }
      }
    } else if (keyType == 'set') {  //bring the set Members
      const getSetMembers = await utils.getSetMembers(planId);
      //if it is a set it will have list of members we can retrieve and check whether there stored
      //value is hash or set
      for (let i = 0; i < getSetMembers.length; i++) {
        const retriveSetKeyType = await retriveKeyType(getSetMembers[i]);
        //check for whether hash or set
        if (retriveSetKeyType === "hash") {
          let newHashJson = {};
          planJson.push(newHashJson);
          await recreateJSON(getSetMembers[i], newHashJson);
        } else if (retriveSetKeyType === "set") {
          let newArrJson = [];
          planJson.push(newHashJson);
          await recreateJSON(getSetMembers[i], newArrJson);
        } else {
          planJson.push(getSetMembers[i]);
        }
      }
    }
    return planJson;
  } catch (error) {
    return error;
  }
}



module.exports = {
  nestedJson,
  recreateJSON
}