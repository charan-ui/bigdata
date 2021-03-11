const { getPlan, setPlanETagKeyValue, deletePlan } = require('../dao/planDAO');
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('../utils//errorResponse');
const logger = require('../utils/logger');

const addPlan = async (req) => {
  const planId = `plan_${req.body.objectId}`;
  const plan = await getPlan(planId);
  if (plan) {
    throw new ErrorResponse(400, `Plan with objectId ${req.body.objectId} already exists!`);
  }
  const eTag = uuidv4();
  const eTagId = `eTag_${req.body.objectId}`;
  const success = await setPlanETagKeyValue({
    planId,
    plan: JSON.stringify(req.body),
    eTagId,
    eTag,
  });
  if (!success) {
    throw new ErrorResponse();
  }
  return success;
}

const fetchPlan = async (req) => {
  const plan = await getPlan(`plan_${req.params.id}`);
  if (!plan) {
    throw new ErrorResponse(404, `Plan with objectId ${req.params.id} does not exist!`);
  }
  const eTag = await getPlan(`eTag_${req.params.id}`);
  if (!eTag) {
    throw new ErrorResponse();
  }
  const planObj = {
    plan: JSON.parse(plan),
    eTag,
  }
  return planObj;
}

const removePlan = async (req) => {
  const plan = await getPlan(`plan_${req.params.id}`);
  if (!plan) {
    throw new ErrorResponse(404, `Plan with objectId ${req.params.id} does not exist!`);
  }
  const success = deletePlan(req.params.id);
  if (!success) {
    throw new ErrorResponse();
  }
}

module.exports = {
  addPlan,
  fetchPlan,
  removePlan,
}