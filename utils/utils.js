const sendSuccessResponse = (res, resObj) => {
  res.status(resObj.httpStatusCode).json({
    success: resObj.message,
  })
}

const sendErrorResponse = (res, error) => {
  if (!error.httpStatusCode || !error.message) {
    error.httpStatusCode = 500;
    error.message = 'Internal Server Error';
  }
  res.status(error.httpStatusCode).json({
    error: error.message,
  });
}

const sendAuthorisationToken = (res, resObj) => {
  res.status(resObj.httpStatusCode).json({
    token: resObj.message,
  })
}

const middleWareErrors = (res,message)=>{
  res.status(res.status).json({
    error:message
  })
}



module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendAuthorisationToken,
  middleWareErrors
};
