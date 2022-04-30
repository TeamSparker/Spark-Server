const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');

/**
 *  @릴리즈_버전정보_조회
 *  @route GET /version
 *  @error
 */

module.exports = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    // return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_USER_PROFILE_SUCCESS, { nickname, profileImg }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
