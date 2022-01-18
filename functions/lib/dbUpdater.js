const functions = require('firebase-functions');
const util = require('./util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const db = require('../db/db');
const { userDB } = require('../db');

exports.scheduledFunction = functions.pubsub.schedule('every 10 seconds').onRun(async (context) => {
  let client;

  // try {
  //   client = await db.connect(req);

  //   res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CERTIFY_SUCCESS, data));
  // } catch (error) {
  //   functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
  //   console.log(error);

  //   res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  // } finally {
  //   client.release();
  // }
  console.log('hello 1 min!');

  return null;
});
