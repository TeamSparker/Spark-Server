const functions = require('firebase-functions');
const util = require('../../../../lib/util');
const statusCode = require('../../../../constants/statusCode');
const responseMessage = require('../../../../constants/responseMessage');
const db = require('../../../../db/db');
const { noticeDB } = require('../../../../db');

/**
 *  @서비스_알림_읽음_처리
 *  @route PATCH /notice/service/read
 *  @body
 *  @error
 */

module.exports = async (req, res) => {
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);
    await noticeDB.serviceReadByUserId(client, userId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SERVICE_READ_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
