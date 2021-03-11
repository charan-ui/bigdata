const { error } = require("console");

class errorResponse extends Error {
  constructor (httpStatusCode, message) {
    super(message);
    this.httpStatusCode = httpStatusCode;
  }
}

module.exports = errorResponse;
