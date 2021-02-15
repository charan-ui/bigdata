/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 15 , 2021
 */

const getPlanDao = require("../dao/getPlanDao");
const addPlanDao = require("../dao/addPlanDao");

/**
 *service function to get a particular plan with respect to passed param id
 *@param {Object} req body
 */
async function getPlanService(req) {
  return new Promise(async function (resolve, reject) {
    try {
      //step-1 check whether the data has been changed in our db
      //we do it using etag
      // pass the etag in header property 'if-none-match'
      const request_etag = req.headers['if-none-match'];
      //step-2 fetch the etag that was created with respect to that planId In our key value store
      const etagId = "etag_" + req.params.id;
      const planId = "plan_" + req.params.id;
      const etagFetchResult = await fetchEtagId(etagId);
      //step:3 now check whether the header etag and etag saved in our db is same
      const checkResult = await checkForDataModification(request_etag, etagFetchResult);
      //if data is modified
      //step:4 check whether the plan exists in our db
      const finalResult = await checkForPlanExistence(planId);
      resolve(finalResult);
    } catch (error) {
      reject(error);
    }
  })
}



/**
 * helper function to hit dao layer to fetch etag with respect to planId
 * @param {String} etagId
 */
async function fetchEtagId(etagId) {
  return new Promise(async function (resolve, reject) {
    try {
      const databaseEtagQueryRes = await getPlanDao.fetchParticularEtagId(etagId);
      resolve(databaseEtagQueryRes);
    } catch (error) {
      reject(error);
    }
  })
}

/**
 * helper function checks the request etag in header and our etag stored in our database
 * @param {String} request_etag etag present in request header
 * @param {String} etagFetchResult etag in our db
 */
async function checkForDataModification(request_etag, etagFetchResult) {
  return new Promise(async function (resolve, reject) {
    const notModifiedObject = {};
    //header etag and etagFetch from our db is same then the data is not changed
    if (request_etag === etagFetchResult) {
      //if same the data is not modified from its previous state
      notModifiedObject.status = 304;
      notModifiedObject.message = "Not modified"
      reject(notModifiedObject);
    }
    resolve(true);
  })
}

/**
 * helper function checks presence of a particular plan In our db
 * @param {String} planId
 */
async function checkForPlanExistence(planId){
  return new Promise(async function (resolve,reject){
    try{
       const fetchPlan = await addPlanDao.fetchParticularPlanId(planId);
       const errorObj = {};
       if(fetchPlan === null ){
         errorObj.status = 400;
         errorObj.message = "the plan that you are requesting does not exist with us"
         throw(errorObj);
       }
    resolve(JSON.stringify(fetchPlan));
    }catch(error){
     reject(error);
    }
  })
}



module.exports = {
  getPlanService
}