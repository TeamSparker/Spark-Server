const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB, sparkDB, dialogDB } = require('../../../db');
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
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.NO_CONTENT, responseMessage.GET_ROOM_DATA_FAIL));
    }

    const startDate = dayjs(room.startAt);
    const endDate = dayjs(room.endAt);
    const now = dayjs().add(9, 'hour');
    const today = dayjs(now.format('YYYY-MM-DD'));
    const leftDay = endDate.diff(today, 'day');
    const day = dayjs(today).diff(startDate, 'day') + 1;

    // @error 2. 진행중인 습관방이 아닌 경우
    if (room.status !== 'ONGOING' || leftDay < 0) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NOT_ONGOING_ROOM));
    }
    const entries = await roomDB.getEntriesByRoomId(client, roomId);

    // @error 3. 접근 권한이 없는 유저인 경우
    const userEntry = entries.filter((entry) => entry.userId === user.userId);

    if (!userEntry.length) {
      res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NOT_MEMBER));
    }
    let lifeDeductionCount = 0;
    const dialogs = await dialogDB.setLifeDeductionDialogsRead(client, user.userId, roomId);
    console.log(dialogs);
    dialogs.map((dialog) => {
      lifeDeductionCount += dialog.lifeDeductionCount;
    });
    const records = await roomDB.getRecordsByDay(client, roomId, day);

    let myRecord = null;

    let considerRecords = [];
    let noneRecords = [];
    let restRecords = [];
    let doneRecords = [];

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
        if (record.status === 'CONSIDER') {
          considerRecords.push({
            recordId: record.recordId,
            userId: record.userId,
            profileImg: record.profileImg,
            nickname: record.nickname,
            status: record.status,
          });
        } else if (record.status === 'NONE') {
          noneRecords.push({
            recordId: record.recordId,
            userId: record.userId,
            profileImg: record.profileImg,
            nickname: record.nickname,
            status: record.status,
          });
        } else if (record.status === 'REST') {
          restRecords.push({
            recordId: record.recordId,
            userId: record.userId,
            profileImg: record.profileImg,
            nickname: record.nickname,
            status: record.status,
          });
        } else {
          doneRecords.push({
            recordId: record.recordId,
            userId: record.userId,
            profileImg: record.profileImg,
            nickname: record.nickname,
            status: record.status,
          });
        }
      }
    });

    const otherRecords = [...considerRecords, ...noneRecords, ...doneRecords, ...restRecords];

    const receivedSpark = await sparkDB.countSparkByRecordId(client, myRecord.recordId);
    myRecord.receivedSpark = parseInt(receivedSpark.count);

    const data = {
      roomId: room.roomId,
      roomName: room.roomName,
      startDate: startDate.format('YYYY.MM.DD.'),
      endDate: endDate.format('YYYY.MM.DD.'),
      moment: userEntry[0].moment,
      purpose: userEntry[0].purpose,
      leftDay,
      life: room.life,
      fromStart: room.fromStart,
      lifeDeductionCount,
      myRecord,
      otherRecords,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ROOM_DETAIL_SUCCESS, data));
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    const slackMessage = `[ERROR BY ${user.nickname} (${user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${error} ${JSON.stringify(error)}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
