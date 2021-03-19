const { client } = require('../config/db');
const { promisify } = require("util");
const hgetAsync = promisify(client.hgetall).bind(client);
const hmsetAsync = promisify(client.hmset).bind(client);
const smembersAsync = promisify(client.smembers).bind(client);
const saddAsync = promisify(client.sadd).bind(client);
const typeAsync = promisify(client.type).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);
const getAsync = promisify(client.get).bind(client);
const getKeysAsync = promisify(client.keys).bind(client);



const getPlan = async (planId) => {
  const plan =  hgetAsync(planId);
  return plan;
}

const getSetMembers = async(planId)=>{
   let members = smembersAsync(planId);
   return members;
}

const saveToPlanMap = async (planId,eachKey,relationShipKey) => {
  hmsetAsync(planId,eachKey,relationShipKey);
  return true;
}

const saveToPlanSet = async (relationShipKey,arrayInnerObjectId) => {
  saddAsync(relationShipKey,arrayInnerObjectId);
  return true;
}

const saveEtag = async (eTag,planId)=>{
  setAsync("etag_"+planId,eTag);
  return true;
}

const getEtag = async(etag)=>{
  const etagsDB =getAsync(etag);
  return etagsDB;
}

const retriveKeyType = async (planId)=>{
  const keyType = typeAsync(planId);
  return keyType
}


const deletePlan = async (planId) => {
  await delAsync(planId);
  return true;
}


const getKeys = async(plan)=>{
  const keys = await getKeysAsync("*"+ plan + "*");
  return keys;
}

module.exports = {
  getPlan,
  saveToPlanMap,
  deletePlan,
  saveToPlanSet,
  saveEtag,
  retriveKeyType,
  getSetMembers,
  getEtag,
  getKeys
}