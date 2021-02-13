/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 12 , 2021
 */

const redisClient = require("../servers/redisServer").redisServerInitialization();
/**
 *
 * @param {String} id of a particular plan
 * @returns null if the particular id is not present in our redis key value store
 */
async function fetchParticularPlanId(planId) {
  return new Promise(async function (resolve, reject) {
    try {
    (await redisClient).get(planId, function (err, res) {
        //if any error handle it in catch block
        if (err) {
          throw (err);
        }
        //else response
        resolve(res)
      })
    } catch (error) {
      reject(error);
    }
  })
}


/**
 * @param {obj} plan
 * @param {string} etag for a plan
 * @param {string} etagId
 * @param {string}planId
 * used to save a plan against a planId
 */
async function savePlanDao(plan, etag, planId, etagId) {
  return new Promise(async function (resolve, reject) {
    try {
      //Set data to Redis
     (await redisClient).set(planId, JSON.stringify(plan));
     (await redisClient).set(etagId, etag);
      resolve
        (
          {
            etag: etag,
            success: true
          }
        )
    } catch (error) {
      reject(error);
    }
  })
}

module.exports = {
  fetchParticularPlanId,
  savePlanDao
}