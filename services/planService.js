const { getPlan, deletePlan, saveEtag, getEtag , getKeys , addToQueue} = require('../dao/planDAO');
const {indexerLoop} = require('../dao/planIndexer');
const { v4: uuidv4 } = require('uuid');

const ErrorResponse = require('../utils//errorResponse');
const nestedJsons = require("../utils/nestedJson")
const logger = require('../utils/logger');



const addPlan = async (req) => {
  const planId = req.body.objectType + '_' + req.body.objectId;
  const plan = await getPlan(planId);
  if (plan) {
    //throw this if plan is present and trying to post it again
    throw new ErrorResponse(400, `Plan with objectId ${req.body.objectId} already exists!`);
  }
  //if the plan is not present prepare the etag
  const eTag = uuidv4();
  //save the plan
  await nestedJsons.nestedJson(planId, req.body);
  //set the etag in redis
  //etag_plan_12xvxc345ssdsds-517 key
  await saveEtag(eTag, planId);
  //add the planId to the queue
  await addToQueue(planId);
  //call the indexer process while posting the data
  await indexerLoop();
  return true;
}


const fetchPlan = async (req) => {
  //fetch the plan from db
  const planId = await getPlan(`plan_${req.params.id}`);
  const request_etag = req.headers["if-none-match"];
  if (!planId) {
    //if the particular plan has no existance
    throw new ErrorResponse(404, `Plan with objectId ${req.params.id} does not exist!`);
  }
  const eTagDB = await getEtag(`etag_plan_${req.params.id}`);
  if (!eTagDB) {
    //if there is no etag with respect to that plan in db
    throw new ErrorResponse(400, `no etag found in our db based on your fetch call Id`);
  }
  //if eTagDB and request_etag  matches send a object response
  if (eTagDB === request_etag) {
    return { status: 304 };
  }
  let resplanObj = {};
  const result = await nestedJsons.recreateJSON(`plan_${req.params.id}`, resplanObj);
  return [result, eTagDB];
}




const patchPlan = async (req) => {
  //resource that has to be patched
  let resourceTobePatched = req.body;
  //prepare the planId
  const planId = `plan_${req.params.id}`;
  //get the request header etag in if-match
  const request_etag = req.headers["if-match"];
  //fetch the etag from db
  const eTagfromDB = await getEtag(`etag_plan_${req.params.id}`);
  //check whether request_etag and etagfromDB are same
  if (request_etag === eTagfromDB) {
    //first error check check whether the resource that is sent carrying a id is present in our db so
    //that it can be patched
    const planPresence = await getPlan(`plan_${req.params.id}`);
    if (!planPresence) {
      //if there is no plan present in our db
      throw new ErrorResponse(404, `Plan with objectId ${req.params.id} does not exist! cannot merge`);
    } else {
      //move to patching since
      // *etag is same in our db and headers
      // *plan is also present
      await nestedJsons.nestedJson(planId, resourceTobePatched);
      //create a new tag after patching
      const newEtag = uuidv4();
      //save the etag to our db
      const savedEtagResponse = await saveEtag(newEtag, planId);
       //add the planId to the queue
       await addToQueue(planId);
       //call the indexer process while patching the data
       await indexerLoop();
      return [newEtag, savedEtagResponse];
    }
  } else {//precondition failed etag because some resource has been changed by someone at db please use the latest
    //etag
    return false;
  }
}


const updatePlan = async (req) => {
  //first take the body that needs to be updated
  let resourceTobeUpdated = req.body;
  //prepare the plan Id
  let planId = `plan_${req.params.id}`;
  //read the etag from the header
  let request_etag = req.headers["if-match"];
  //fetch the etag from the db
  const eTagfromDB = await getEtag(`etag_plan_${req.params.id}`);
  //check whether the etag stored in db and etag in header are the same
  if (request_etag === eTagfromDB) {
     //first error check check whether the resource that is sent carrying a id is present in our db so
    //that it can be patched
    const planPresence = await getPlan(`plan_${req.params.id}`);
    if (!planPresence) {
      //if there is no plan present in our db
      throw new ErrorResponse(404, `Plan with objectId ${req.params.id} does not exist! cannot update`);
    }else{
       //move to updating since
      // *etag is same in our db and headers
      // *plan is also present
      await nestedJsons.nestedJson(planId, resourceTobeUpdated);
      //create a new tag after patching
      const newEtag = uuidv4();
      //save the etag to our db
      const savedEtagResponse = await saveEtag(newEtag, planId);
      //add the planId to the queue
      await addToQueue(planId);
      //call the indexer process while updating the data
       await indexerLoop();
      return [newEtag, savedEtagResponse];
    }
  }else{
    //precondition failed for update to happen
    return false;
  }
}



const removePlan = async (req) => {
  const planID = `plan_${req.params.id}`;
  const plan = await getPlan(`plan_${req.params.id}`);
  if (!plan) {
    throw new ErrorResponse(404, `Plan with objectId ${req.params.id} does not exist!`);
  }
  const keys = await getKeys(plan);

  if(keys.length > 0)
  {
    const deleteResult =  await deletePlan(keys);
    //add to the queue
    await addToQueue(planID + "_delete");
    //index it
    await indexerLoop();
    //return the deleted result
    return deleteResult;
  }
return false;
}







module.exports = {
  addPlan,
  fetchPlan,
  removePlan,
  getEtag,
  patchPlan,
  updatePlan
}