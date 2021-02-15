/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 15 , 2021
 */


//dependencies
const router = require("express").Router();
//service import
const getPlanService = require("../service/getPlanService");


/**
 * router for fetching a particular plan
 *  @param {call back function} route entry point
 */
router.get('/plan/:id', async function (req, res) {
  //call the service layer function here
  await getPlanService.getPlanService(req)
    .then(result => {
      res.status(200).send(result);
    }).catch(err => {
      res.send(err);
    })
})








module.exports = router;