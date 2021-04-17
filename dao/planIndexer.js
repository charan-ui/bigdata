//import elasticsearch
const elasticSearch = require("elasticsearch");
//index name
const INDEX_NAME = "demoplan";
//custom imp
const planDao = require('./planDAO');
const nestedJsons = require("../utils/nestedJson")

//intialize the indexer client
let elasticClient = new elasticSearch.Client({
  host: "http://localhost:9200",
  log: "info",
});


//function indexer loop
let indexerLoop = async () => {
  //access the planId
  const planId = await planDao.redisLoop();
  //if there is planId in the workqueue
  if (planId) {
    const processOutput = await processingJobs(planId);
    //delete the id from working queue
    planDao.redisLoopRem(planId);

  } else {
    //there is nothing in the queue
    return 'there is nothing in queue';
  }

  //from function
  return true;
}

async function processingJobs(planId) {
  let id = planId.split("_")[1];
  //if the planId string retrieved from the queue has delete in it delete the index
  if (planId.includes('delete')) {
    const resultDelete = await deletePlan(id);
    return resultDelete;
  } else {
    //retrieve the json associated with that id
    let resJson = {}
    const getUseCaseJsonResult = await nestedJsons.recreateJSON(planId, resJson);
    //index the json data
    const resultOfIndexing = await indexPlan(id, getUseCaseJsonResult);
    return resultOfIndexing;
  }
}


async function indexPlan(id, getUseCaseJsonResult) {
  //entering to index the plan
  //step:1
  //create a join field of your choice according to use case
  //this is the main json object parent of all Ex: name field I am using is the value of objectType
  //this has a objectType = "plan"
  //there will be join field called plan_service_join created in our usecase
  getUseCaseJsonResult['plan_service_join'] = {
    name: "plan"
  }
  //step:2
  //store the keys values in a variable for future use
  let planCostShares = getUseCaseJsonResult['planCostShares'];//a object
  let linkedPlanServices = getUseCaseJsonResult['linkedPlanServices'];//a array having multiple objects in it
  //step:3
  //delete these object and array fiels for only having simple field jsons in it
  delete getUseCaseJsonResult['planCostShares'];
  delete getUseCaseJsonResult['linkedPlanServices'];
  //step:4
  //send the data to indexer
  await indexPartialPlan(id, getUseCaseJsonResult);
  //step:5
  //planCostShares is a object that has to be indexed
  //planCostShares value is a child of plan (bigger Json)
  //name given to the join field relation will be value of objectType of planCostShares
  //parent is the objectId of the plan (bigger Json)
  planCostShares['plan_service_join'] = {
    name: 'membercostshare',
    parent: getUseCaseJsonResult.objectId
  }
  //step:6
  //send the data to indexer
  await indexPartialPlan(planCostShares.objectId, planCostShares);
  //step:7
  //handling of key that had array of objects as its value
  //iterating over each and every object
  for (let j = 0; j < linkedPlanServices.length; j++) {
    //access each element in theand store that in a variable(upper JSON)
    let planservice = linkedPlanServices[j];
    //store the object property (sub1 JSON)
    let linkedService = planservice['linkedService'];
    //store one more object property(sub2 JSON)
    let planserviceCostShares = planservice['planserviceCostShares'];
    //delete the object properties for indexing
    delete planservice['linkedService'];
    delete planservice['planserviceCostShares'];

    //index the UPPER JSON parent being the objectId of getUseCaseJsonResult
    planservice['plan_service_join'] = {
      name: 'planservice',
      parent: getUseCaseJsonResult.objectId
    }
    //index it to my indexer
    await indexPartialPlan(planservice.objectId, planservice);

    //start indexing sub1 Json
    linkedService['plan_service_join'] = {
      name: 'service',
      parent: planservice.objectId
    }
    //index it to the indexer
    await indexPartialPlan(linkedService.objectId, linkedService);

    //start indexing the sub2 Json
    planserviceCostShares['plan_service_join'] = {
      name: 'planservice_membercostshare',
      parent: planservice.objectId
    }
    //index it to the indexer
    await indexPartialPlan(planserviceCostShares.objectId, planserviceCostShares);
  }

  console.log('successful indexed');
  return true;
}


async function indexPartialPlan(id, body) {
  elasticClient.index({
    index: INDEX_NAME,
    type: '_doc',
    id: id,
    body: body,
    routing: "1"
  })
  return true;
}


async function deletePlan(id) {
  console.log("Starting to delete plan id ==> " + id);
  elasticClient.delete({
    id: id,
    type: '_doc',
    index: INDEX_NAME,
  }, function (error, response) {
    if (error == undefined) {
      console.log("Deleted successfully");
    } else {
      console.log("Deletion failed", error);
    }
  });
  return true;
}


module.exports = {
  indexerLoop
}