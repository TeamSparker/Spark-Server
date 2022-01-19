const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const pushAlarm = require('../../../lib/pushAlarm');
const slackAPI = require('../../../middlewares/slackAPI');
const { userDB, roomDB, recordDB, noticeDB } = require('../../../db');

/**
 *  @습관방_시작
 *  @route POST /room/:roomId/start
 *  @body
 *  @error
 *      1. roomId가 숫자가 아님
 *      2. 유효하지 않은 roomId
 *      3. 권한이 없는 사용자로부터의 요청
 *      4. 이미 시작된 방
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const userId = user.userId;

  let client;

  try {
    client = await db.connect(req);

    // @error 1. roomId가 숫자가 아님
    if (isNaN(roomId)) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_NOT_FOUND));
    }

    let room = await roomDB.getRoomById(client, roomId);

    // @error 2. 유효하지 않은 roomId
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_NOT_FOUND));
    }

    // @error 3. 권한이 없는 사용자로부터의 요청
    if (userId !== room.creator) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.PRIV_NOT_FOUND));
    }

    // 습관방 status ONGOING으로 변경
    room = await roomDB.startRoomById(client, roomId);

    // @error 4. 이미 시작된 방
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.START_ROOM_ALREADY));
    }

    const entries = await roomDB.getEntriesByRoomId(client, roomId);
    const { title, body, isService } = alarmMessage.ROOM_NEW(room.roomName);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const targetId = entry.userId;
      const target = await userDB.getUserById(client, targetId);
      const receiverToken = target.deviceToken;

      // 참여자들의 0일차 record 생성
      await recordDB.insertRecordById(client, entry.entryId, room.startAt);

      // 방이 시작되면, 참여자들에게 알림 및 푸시알림 보내기
      await noticeDB.addNotification(client, title, body, 'Spark_IMG_URL', targetId, isService);
      pushAlarm.send(req, res, receiverToken, 'Spark', body);
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.START_ROOM_SUCCESS));
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
