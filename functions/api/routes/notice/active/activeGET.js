const functions = require('firebase-functions');
const util = require('../../../../lib/util');
const statusCode = require('../../../../constants/statusCode');
const responseMessage = require('../../../../constants/responseMessage');
const db = require('../../../../db/db');
const { noticeDB } = require('../../../../db');

/**
 *  @활동_알림_조회
 *  @route GET /notice/active?lastid=&size=
 *  @error
 */

module.exports = async (req, res) => {
  const user = req.user;
  const userId = user.userId;
  const { lastid, size } = req.query;

  let client;

  try {
    client = await db.connect(req);

    const actives = await noticeDB.getActivesByUserId(client, userId, lastid, size);

    const notices = actives.map((a) => {
      const notice = {};
      notice['noticeId'] = a.notificationId;
      notice['noticeTitle'] = a.title;
      notice['noticeImg'] = a.thumbnail;
      notice['noticeContent'] = a.content;
      notice['createdAt'] = a.createdAt.toISOString().split('T')[0].replace(/-/g, '/');
      return notice;
    });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ACTIVE_GET_SUCCESS, { notices }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
