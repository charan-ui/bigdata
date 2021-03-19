
const jwt = require("jsonwebtoken");
const fs = require("fs");
const ErrorResponse = require('./utils//errorResponse');
/**
 *
 * @param {req body}
 * @returns JWT token signed using a private key
 */
const generateAccessToken = async (req) => {
  // expires (1800 seconds = 30 minutes)
  const privateKey = fs.readFileSync('./private.key', 'utf8');
  //object payload format
  return jwt.sign(req.body, privateKey, { expiresIn: '300s', algorithm: 'RS256', audience: 'http://localhost:5000' });
}


module.exports = {
  generateAccessToken
}