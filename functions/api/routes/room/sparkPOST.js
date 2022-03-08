const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const pushAlarm = require('../../../lib/pushAlarm');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB, roomDB, sparkDB, noticeDB } = require('../../../db');

/**
 *  @스파크_보내기
 *  @route POST /room/:roomId/spark
 *  @body content: string
 *  @error
 *      1. content/ roomId가 전달되지 않음
 *      2. 존재하지 않는 습관방
 *      3. 유저가 해당 습관방에 참여하지 않는 경우
 *      4. 쉴래요 습관완료한 사람한테 스파크 보내려함
 *      5. 자신에게 스파크를 보내려 할 때
 *      6. 해당 습관방의 record가 아닐 때
 */

module.exports = async (req, res) => {
  const { recordId, content } = req.body;
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  // @error 1. content/ roomId가 전달되지 않음
  if (!roomId || !content) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);
    // @error 2. 존재하지 않는 습관방
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_INVALID));
    }

    const entry = await roomDB.getEntryByIds(client, roomId, user.userId);

    // @error 3. 유저가 해당 습관방에 참여하지 않는 경우
    if (!entry) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_MEMBER));
    }

    // @error 6. 해당 습관방의 record가 아닐 때
    const record = await roomDB.getRecordById(client, recordId);

    if (record.roomId !== Number(roomId)) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_MATCH_ROOM_AND_RECORD));
    }

    // @error 4. 쉴래요 습관완료한 사람한테 스파크 보내려함
    if (record.status === 'DONE' || record.status === 'REST') {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.DONE_OR_REST_MEMBER));
    }

    // @error 5. 자신에게 스파크를 보내려 할 때
    if (record.userId === userId) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.CANNOT_SEND_SPARK_SELF));
    }

    const spark = await sparkDB.insertSpark(client, recordId, userId, content);

    // 스파크를 보내면 받는 사람에게 알림 및 푸시알림 보내기
    const { title, body, isService, category } = alarmMessage.SEND_SPARK(user.nickname, room.roomName, content);
    const receiver = await userDB.getUserById(client, record.userId);
    await noticeDB.addNotification(client, title, body, user.profileImg, receiver.userId, isService);
    pushAlarm.send(req, res, title, body, receiver.deviceToken, category);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.SEND_SPARK_SUCCESS));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
