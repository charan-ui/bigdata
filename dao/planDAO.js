const { client } = require('../config/db');
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

const getPlan = async (planId) => {
  const plan = await getAsync(planId);
  return plan;
}

const setPlanETagKeyValue = async (queryObj) => {
  await setAsync(queryObj.planId, queryObj.plan);
  await setAsync(queryObj.eTagId, queryObj.eTag);
  return true;
}

const deletePlan = async (planId) => {
  await delAsync(`plan_${planId}`, `eTag_${planId}`);
  return true;
}

module.exports = {
  getPlan,
  setPlanETagKeyValue,
  deletePlan,
}