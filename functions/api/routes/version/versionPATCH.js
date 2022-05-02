const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { versionDB } = require('../../../db');

/**
 *  @릴리즈_버전정보_갱신
 *  @route PATCH /version
 *  @error
 *      1. 신규 버전이 전달되지 않음
 */

module.exports = async (req, res) => {
  const { newVersion } = req.body;

  // error 1. 신규 버전이 전달되지 않음
  if (!newVersion) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    await versionDB.updateRecentVersion(client, String(newVersion));

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_RECENT_VERSION_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);

    return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
