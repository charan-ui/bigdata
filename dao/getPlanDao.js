/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 15 , 2021
 */

const redisClient = require("../servers/redisServer").redisServerInitialization();


/**
 * @param {String} etagId of a particular plan
 * @returns null if the etag is not present and etag value if it is present
 */

async function fetchParticularEtagId(etagId) {
  return new Promise(async function (resolve, reject) {
    try {
    (await redisClient).get(etagId, function (err, res) {
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
  fetchParticularEtagId
}