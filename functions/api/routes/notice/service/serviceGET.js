const functions = require('firebase-functions');
const dayjs = require('dayjs');
const util = require('../../../../lib/util');
const statusCode = require('../../../../constants/statusCode');
const responseMessage = require('../../../../constants/responseMessage');
const db = require('../../../../db/db');
const slackAPI = require('../../../../middlewares/slackAPI');
const { noticeDB } = require('../../../../db');
const { passedDayToStr } = require('../../../../lib/passedDayToStr');

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

    const newActiveNum = await noticeDB.getNumberOfUnreadActiveNoticeById(client, userId);
    const newActive = newActiveNum > 0 ? true : false;

    const services = await noticeDB.getServicesByUserId(client, userId, parseInt(lastId), parseInt(size));
    let now = dayjs().add(9, 'hour');
    now = now.set('hour', 0);
    now = now.set('minute', 0);
    now = now.set('second', 1);

    const notices = services.map((s) => {
      const notice = {};
      let createdAt = dayjs(s.createdAt);
      createdAt = createdAt.set('hour', 0);
      createdAt = createdAt.set('minute', 0);
      createdAt = createdAt.set('second', 0);
      const passedDay = now.diff(createdAt, 'd');

      notice['noticeId'] = s.notificationId;
      notice['noticeTitle'] = s.title;
      notice['noticeContent'] = s.content;
      notice['day'] = passedDayToStr(passedDay);
      notice['isNew'] = !s.isRead;
      return notice;
    });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_SERVICE_SUCCESS, { newActive, notices }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    const slackMessage = `[ERROR BY ${user.nickname} (${user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
