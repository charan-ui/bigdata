const express = require('express');
const ErrorResponse = require('../utils/errorResponse');
const utils = require('../utils/utils');
const { addPlan, fetchPlan, removePlan, patchPlan, updatePlan } = require('../services/planService');
var Validator = require('jsonschema').Validator;
let verifyToken = require('../verifyToken');
const schema = require('../models/payloadSchemaModel');
const logger = require('../utils/logger');
const token = require('../token');
const FILE_NAME = 'planRoute.js';
const router = express.Router();
/**
 * @function creates a plan in DB
 * @request post
 */
router.post('/',verifyToken,async (req, res) => {
  logger.info(`Entering route POST / at: ${FILE_NAME}`);
  try {
    var validator = new Validator();
    const validatorResult = validator.validate(req.body, schema, { required: true });
    if (validatorResult.errors.length > 0) {
      throw new ErrorResponse(400, `Payload ${validatorResult.errors[0].stack}`);
    }
    await addPlan(req);
    utils.sendSuccessResponse(res, {
      httpStatusCode: 201,
      message: 'Plan successfully added!',
    });
  } catch (error) {
    logger.error(`Error in POST / route at: ${FILE_NAME} \n${error}`);
    utils.sendErrorResponse(res, error);
  }
});


/**
 * @function fetches a plan in DB
 * @request get
 */
router.get('/:id',verifyToken, async (req, res) => {
  logger.info(`Entering route GET /:id at: ${FILE_NAME}`);
  try {
    let planObj = await fetchPlan(req);
    //if etag matches
    if (typeof planObj === 'object' && planObj.status === 304) {
      res.status(304).send();
    } else {
      res.setHeader("ETAG", planObj[1]);
      utils.sendSuccessResponse(res, {
        httpStatusCode: 200,
        message: planObj[0],
      });
    }
  } catch (error) {
    logger.error(`Error in GET /:id route at: ${FILE_NAME} \n${error}`);
    utils.sendErrorResponse(res, error);
  }
});

/**
 * @function patches a plan in DB
 * @request patch
 */
router.patch('/:id', verifyToken,async (req, res) => {
  logger.info(`Entering patch request to patch a particular plan /:id: ${FILE_NAME}`)
  try {
    let patchResult = await patchPlan(req);
    if (typeof patchResult === 'object' && patchResult[1]) {
      res.setHeader("ETAG", patchResult[0]);
      utils.sendSuccessResponse(res, {
        httpStatusCode: 200,
        message: 'Plan successfully patched!',
      });
    } else {
      utils.sendSuccessResponse(res, {
        httpStatusCode: 412,
        message: 'pre condition failed (some one has changed the resource to the db , fetch the recent etag from get call and try patching)',
      });
    }
  } catch (error) {
    logger.error(`Error in patch /:id route at: ${FILE_NAME} \n${error}`);
    utils.sendErrorResponse(res, error);
  }
})

/**
 * @function updates a plan in DB
 * @request put
 */
router.put('/:id',verifyToken, async (req, res) => {
  logger.info(`Entering into put request api to update a particular plan /:id ${FILE_NAME}`);
  try {
    let validator = new Validator();
    const validatorResult = validator.validate(req.body, schema, { required: true });
    if (validatorResult.errors.length > 0) {
      throw new ErrorResponse(400, `Payload ${validatorResult.errors[0].stack}`);
    } else {
      let updatePlanResult = await updatePlan(req);
      if (typeof updatePlanResult === 'object' && updatePlanResult[1]) {
        res.setHeader("ETAG", updatePlanResult[0]);
        utils.sendSuccessResponse(res, {
          httpStatusCode: 200,
          message: 'Plan successfully updated!',
        })
      } else {
        utils.sendSuccessResponse(res, {
          httpStatusCode: 412,
          message: 'pre condition failed (some one has changed the resource to the db , fetch the recent etag from get call and try updating)',
        });
      }
    }
  } catch (error) {
    logger.error(`error in put plan api /:id `);
    utils.sendErrorResponse(res, error);
  }
})


/**
 * @function deletes a plan in DB
 * @request delete
 */
router.delete('/:id',verifyToken, async (req, res) => {
  logger.info(`Entering route DELETE /:id at: ${FILE_NAME}`);
  try {
    await removePlan(req);
    utils.sendSuccessResponse(res, {
      httpStatusCode: 200,
      message: `Plan with objectId ${req.params.id} deleted successfully!`,
    });
  } catch (error) {
    logger.error(`Error in DELETE /:id route at: ${FILE_NAME} \n${error}`);
    utils.sendErrorResponse(res, error);
  }
});


/**
 * @function generate a JWT token
 * @request post
 */
 router.post('/token', async (req, res) => {
  try {
    const tokenResult = await token.generateAccessToken(req);
    utils.sendAuthorisationToken(res, {
      httpStatusCode: 200,
      message: tokenResult
    });
  } catch (error) {
    logger.error(`Error in generate token /token route at: ${FILE_NAME} \n${error}`);
    utils.sendErrorResponse(res, error);
  }
})

module.exports = router;
