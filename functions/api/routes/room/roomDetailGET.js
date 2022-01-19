const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, roomDB, sparkDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');
const slackAPI = require('../../../middlewares/slackAPI');
const dayjs = require('dayjs');

/**
 *  @습관방_상세_조회
 *  @route GET /room/:roomId
 *  @error
 *      1. 존재하지 않는 습관방인 경우
 *      2. 진행중인 습관방이 아닌 경우
 *      3. 접근 권한이 없는 유저인 경우
 */

module.exports = async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;

  let client;

  try {
    client = await db.connect(req);

    const room = await roomDB.getRoomById(client, roomId);

    // @error 1. 존재하지 않는 습관방인 경우
    if (!room) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.ROOM_ID_INVALID));
    }

    const startDate = dayjs(room.startAt);
    const endDate = dayjs(room.endAt);
    const now = dayjs().add(9, 'hour');
    const today = dayjs(now.format('YYYY-MM-DD'));
    const leftDay = endDate.diff(today, 'day');
    const day = today.diff(startDate, 'day');

    // @error 2. 진행중인 습관방이 아닌 경우
    if (room.status !== 'ONGOING' || leftDay < 0) {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_ONGOING_ROOM));
    }
    const entries = await roomDB.getEntriesByRoomId(client, roomId);

    // @error 3. 접근 권한이 없는 유저인 경우
    const userEntry = entries.filter((entry) => entry.userId === user.userId);

    if (!userEntry.length) {
      res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NOT_MEMBER));
    }
    const records = await roomDB.getRecordsByDay(client, roomId, day);

    let myRecord = null;

    let otherRecords = [];

    records.map((record) => {
      if (record.userId === user.userId) {
        myRecord = {
          recordId: record.recordId,
          userId: record.userId,
          profileImg: record.profileImg,
          nickname: record.nickname,
          status: record.status,
          rest: record.rest,
        };
      } else {
        otherRecords.push({
          recordId: record.recordId,
          userId: record.userId,
          profileImg: record.profileImg,
          nickname: record.nickname,
          status: record.status,
        });
      }
    });

    const recievedSpark = await sparkDB.countSparkByRecordId(client, myRecord.recordId);
    myRecord.recievedSpark = parseInt(recievedSpark.count);

    console.log('myRecrod', myRecord);
    console.log('otherRecords', otherRecords);

    const data = {
      roomId,
      roomName: room.roomName,
      startDate: startDate.format('YYYY.MM.DD.'),
      endDate: endDate.format('YYYY.MM.DD.'),
      moment: userEntry[0].moment,
      purpose: userEntry[0].purpose,
      leftDay,
      life: room.life,
      fromStart: room.fromStart,
      myRecord,
      otherRecords,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ROOM_DETAIL_SUCCESS, data));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
