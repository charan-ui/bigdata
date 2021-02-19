/**
 * @author Charan H M
 * @CopyRights Rewards
 * @Date FEB 12 , 2021
 */

var promiseFactory = require("q").promise,
    redis = require('promise-redis')(promiseFactory);

 //default port of redis
 const REDIS_PORT = 6379;


/**
 * This function is for common intialisation of redis port before any operation into the db
 */

 async function redisServerInitialization() {
      const client = redis.createClient(REDIS_PORT);
      //on error
      client.on("error",function (err) {
          return err
      })
    return client;
}

module.exports ={
  redisServerInitialization
}