const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const alarmMessage = require('../../../constants/alarmMessage');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const pushAlarm = require('../../../lib/pushAlarm');
const dayjs = require('dayjs');
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

    const entries = await roomDB.getEntriesByRoomIds(client, [roomId]);

    const insertEntries = entries.map((o) => {
      // 추가해줄 record들의 속성들 빚어주기
      const startDate = dayjs(o.startAt);
      const now = dayjs().add(9, 'hour');
      const today = now.format('YYYY-MM-DD');
      const day = dayjs(today).diff(startDate, 'day') + 1;
      const queryParameter = '(' + o.entryId + ",'" + now.format('YYYY-MM-DD') + "'," + day + ')';

      return queryParameter;
    });

    // 참여자들의 1일차 record 생성
    await recordDB.insertRecords(client, insertEntries);

    const { title, body, isService, category } = alarmMessage.ROOM_NEW(room.roomName);

    const allUsers = await roomDB.getAllUsersById(client, roomId);

    // 푸시알림 전송
    const receiverTokens = allUsers.filter((u) => u.pushRoomStart).map((u) => u.deviceToken);
    pushAlarm.sendMulticastByTokens(req, res, title, body, receiverTokens, category);

    // notification 생성
    const notifications = allUsers.map((u) => {
      return `('${title}', '${body}', '', ${u.userId}, ${isService}, false, ${room.roomId})`;
    });

    if (notifications.length) {
      await noticeDB.addNotifications(client, notifications);
    }

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.START_ROOM_SUCCESS));
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
