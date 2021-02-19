/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 12 , 2021
 */

const helmet = require('helmet');
//import packages
const express = require('express');

//app
const app = express();
const compression = require('compression');
const bodyParser = require('body-parser');


//context-path
const appContextPath = '/api'
//app port
const appPort = '7000';


const addPlanRoute = require('./routes/addPlanRoute');
const getPlanRoute = require('./routes/getPlanRoute');
const deletePlanRoute = require('./routes/deletePlanRoute');


app.set('view engine', 'html');
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 5000 }));
app.use(helmet());
app.use(helmet.noCache());//set Cache-control header
app.use(compression());
app.use(function (err, req, res, next) {
  return res.status(500);
});


//routes
app.use(appContextPath, addPlanRoute);
app.use(appContextPath, getPlanRoute);
app.use(appContextPath, deletePlanRoute)


//starting server
const server = app.listen(appPort, function () {
  const port = server.address().port;
  console.log('Express server listening on port ', port);
});


module.exports = app;