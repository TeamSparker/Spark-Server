const functions = require('firebase-functions');
const util = require('../../../../lib/util');
const statusCode = require('../../../../constants/statusCode');
const responseMessage = require('../../../../constants/responseMessage');
const db = require('../../../../db/db');
const { noticeDB } = require('../../../../db');

/**
 *  @서비스_알림_조회
 *  @route GET /notice/service?lastId=&size=
 *  @error
 */

module.exports = async (req, res) => {
  const user = req.user;
  const userId = user.userId;
  const { lastId, size } = req.query;

  let client;

  try {
    client = await db.connect(req);

    const services = await noticeDB.getServicesByUserId(client, userId, parseInt(lastId), parseInt(size));

    const notices = services.map((s) => {
      const notice = {};
      notice['noticeId'] = s.notificationId;
      notice['noticeTitle'] = s.title;
      notice['noticeImg'] = s.thumbnail;
      notice['noticeContent'] = s.content;
      notice['createdAt'] = s.createdAt.toISOString().split('T')[0].replace(/-/g, '/');
      return notice;
    });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SERVICE_SUCCESS, { notices }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
