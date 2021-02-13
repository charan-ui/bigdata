/**
 * @author Charan H M
 * @CopyRights bigData
 * @Date FEB 12 , 2021
 */


/**
* Helper function to form and send error response
* @param {Object}req body
* @param {Object} res body
* @param {Array} errors array
*/
function _sendValidationErrorResponse(req, res, errors) {
  const validationArrayErrors = [];
  //iterating through the errors array
  errors.map((error) => {
    validationArrayErrors.push
      (
        {
          property: error.property,
          message: error.message,
          name: error.name,
          argument: error.argument,
          stack: error.stack
        }
      )
  })

  res.status(400);
  res.send({errors: validationArrayErrors}).end();
}


module.exports = Object.freeze({ _sendValidationErrorResponse });