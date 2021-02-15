/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 12 , 2021
 */

//dependencies
const router = require("express").Router();
//validation json against which the req body has to be validated
const schema = require("../schema.json");
//validator import
let Validator = require("jsonschema").Validator;

//create a object of validator
let schemaValidator = new Validator();
const sendErrorresponse = require("../utils/errorUtils")._sendValidationErrorResponse;
const addPlanService = require("../service/addPlanService")




/**
 * Route for addPlan
 * @param {call back function} route entry point
 */
router.post("/addPlan", async function (req, res) {
  //first check the request body against json validator
  let validationResult = schemaValidator.validate(req.body, schema);
  //if validation result array length has content then send the validation error
  if (validationResult.errors.length > 0) {
    sendErrorresponse(req, res, validationResult.errors);
  } else {
    //move to the service layer for next steps
    await addPlanService.addPlanService(req)
      .then(result => {
        if (result.success) {
          res.setHeader("etag", result.etag);
           res.status(201)
            .send({ message: "Plan created successfully" });
        }
      }).catch(error => {
        res.status(400).send({ message: 'error in add plan api', errorDetails: error });
      })

  }
});


module.exports = router;