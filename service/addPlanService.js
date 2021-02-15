/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 12 , 2021
 */
//crypto library
const crypto = require("crypto");


const addPlanData = require("../dao/addPlanDao");

/**
 *service function to add plan into our database
 *@param {Object} req body
 */
async function addPlanService(req) {
  return new Promise(async function (resolve, reject) {
    try {
      //first get the object Id from the request body
      const plan = req.body;
      //creating a custom id  to use as a key to the  datastore
      const planId = "plan_" + plan.objectId;
      //fetch a particular plan with that id
      const fetchResult = await addPlanData.fetchParticularPlanId(planId);
      //check and create the data in the key value store
      const finalResult = await checkAndCreatePlan(fetchResult, plan, planId);
      //resolving result
      resolve(finalResult);
    } catch (error) {
      reject(error);
    }
  })
}


/**
 * Helper function to create plan in our key value store
 * @param {Object} fetchResult
 * @param {Object}Plan
 * @param {String}planId
 */

async function checkAndCreatePlan(fetchResult, plan, planId) {
  return new Promise(async function (resolve, reject) {
    const errorObj = {};
    let created_At = new Date();
    plan.created_at = created_At;
    plan.updated_at = created_At;
    try { //if the fetch result is not null then there is already a plan existing in that id so throw a error already present
      if (fetchResult !== null) {
        errorObj.message = "Plan  already exists"
        errorObj.status = 400;
        throw(errorObj);
      }else {
        //create the plan with the id
        //step:1 create a etag
        const etag = await createEtag(created_At);
        //steP:2 etagId creation
        const etagId = "etag_" + plan.objectId ;
        const insertResult = await addPlanData.savePlanDao(plan,etag ,planId ,etagId)
        resolve(insertResult);
      }
    } catch (error) {
      reject(error);
    }

  })
}

/**
 * used to create a etag
 * @param {Date} created_At
 */

async function createEtag(created_At){
  return new Promise(async function (resolve,reject)
  {
    const etag = crypto.createHash("md5").update(created_At.toString()).digest("hex");
    resolve(etag);
  })
}




module.exports = {
  addPlanService
}