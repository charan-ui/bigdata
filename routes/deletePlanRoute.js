/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 19 , 2021
 */

//dependencies
const router = require("express").Router();
//service import
const deletePlanService = require("../service/deletePlanService");
/**
 * Route for deletePlan
 * @param {call back function} route entry point
 */
router.delete('/plan/:id', async function (req, res) {
  //call the service function for deleting a particular plan
  await deletePlanService.deletePlanService(req)
    .then(result => {
      res.status(200).send(result);
    }).catch(error => {
      console.log(error);
      res.send(error);
    })
})



module.exports = router;
