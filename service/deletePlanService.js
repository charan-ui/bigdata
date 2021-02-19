/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 19 , 2021
 */

const deletePlan = require("../dao/deletePlanDao");

/**
*service function to get a particular plan with respect to passed param id
*@param {Object} req body
*/
async function deletePlanService(req) {
return new Promise(async function (resolve, reject) {
  try {
    //prepare planId and etagId
    const planId = "plan_" + req.params.id;
    //prepare etagid
    const etagId = 'etag_' + req.params.id;
    //call delete plan dao function
    await deletePlan.deletePlandao(planId);
    //call delete etag dao function
    await deletePlan.deleteEtagDao(etagId);
    const result = { Message: "Plan with id " + req.params.id + " deleted" };
    resolve(result);
  } catch (error) {
    reject(error);
  }
});
}


module.exports = {
  deletePlanService
}