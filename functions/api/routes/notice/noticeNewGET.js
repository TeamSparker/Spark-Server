const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { noticeDB } = require('../../../db');

/**
 *  @새로운_빨콩_알림_조회
 *  @route GET /notice/new
 *  @error
 *
 */

module.exports = async (req, res) => {
  const user = req.user;

  let client;

  try {
    client = await db.connect(req);

    const numOfUnreadServiceNotice = await noticeDB.getNumberOfUnreadServiceNoticeById(client, user.userId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NEW_NOTICE_GET_SUCCESS, { newNotice: numOfUnreadServiceNotice > 0 ? true : false }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};