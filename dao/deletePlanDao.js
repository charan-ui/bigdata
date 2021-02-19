/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 19, 2021
 */

const redisClient = require("../servers/redisServer").redisServerInitialization();
/**
 * @param {String} planId of a particular plan
 * @deletes plan associated with that planId
 */
async function deletePlandao(planId) {
  return new Promise(async function (resolve, reject) {
    try {
      (await redisClient).del(planId, function (err, res) {
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
 * @param {String} etagId of a particular plan
 * @deletes etag associated with a particular plan
 */
async function deleteEtagDao(etagId) {
  return new Promise(async function (resolve, reject) {
    try {
      (await redisClient).del(etagId, function (err, res) {
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




module.exports = {
  deletePlandao,
  deleteEtagDao
}