const express = require('express');
const ErrorResponse = require('../utils/errorResponse');
const utils = require('../utils/utils');
const { addPlan, fetchPlan, removePlan } = require('../services/planService');
var Validator = require('jsonschema').Validator;
const schema = require('../models/payloadSchemaModel');
const logger = require('../utils/logger');
const FILE_NAME = 'planRoute.js';
const router = express.Router();

router.post('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
  logger.info(`Entering route GET /:id at: ${FILE_NAME}`);
  try {
    const planObj = await fetchPlan(req);
    res.header('ETag', planObj.eTag);
    utils.sendSuccessResponse(res, {
      httpStatusCode: 200,
      message: planObj.plan,
    });
  } catch (error) {
    logger.error(`Error in GET /:id route at: ${FILE_NAME} \n${error}`);
    utils.sendErrorResponse(res, error);
  }
});

router.delete('/:id', async (req, res) => {
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

module.exports = router;
