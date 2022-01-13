const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { noticeDB } = require('../../../db');

/**
 *  @서비스_및_활동_알림_삭제
 *  @route GET /notice/:noticeId
 *  @error
 *      1. 알림 id가 전달되지 않음
 *      2. 올바르지 않은 noticeId가 전달된 경우
 *      3. 알림 삭제 권한이 없는 사용자가 요청을 보낸 경우
 */

module.exports = async (req, res) => {
  const { noticeId } = req.params;
  const user = req.user;
  const userId = user.userId;

  // @error 1. 알림 id가 전달되지 않음
  if (!noticeId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const notice = await noticeDB.getNoticeByNoticeId(client, noticeId);

    // @error 2. 올바르지 않은 noticeId가 전달된 경우
    if (!notice) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOTICE_ID_NOT_VALID));
    }

    // @error 3. 알림 삭제 권한이 없는 사용자가 요청을 보낸 경우
    if (userId !== notice.receiverId) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    await noticeDB.deleteNoticeByNoticeId(client, noticeId);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.NOTICE_DELETE_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
