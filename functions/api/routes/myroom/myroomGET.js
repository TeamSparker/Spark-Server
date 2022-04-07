const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB, sparkDB } = require('../../../db');
const slackAPI = require('../../../middlewares/slackAPI');
const dayjs = require('dayjs');
const _ = require('lodash');

/**
 *  @보관함_리스트_불러오기
 *  @route GET /myroom/:roomType?lastId=&size=
 *  @error
 *    1. 잘못된 roomType
 *    2. 잘못된 lastId
 */

module.exports = async (req, res) => {
  const lastId = Number(req.query.lastId);
  const size = Number(req.query.size);
  const roomType = req.query.type;
  const user = req.user;

  let client;

  // @error 1. 잘못된 roomType
  if (!(roomType === 'ONGOING' || roomType === 'COMPLETE' || roomType === 'FAIL')) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.OUT_OF_VALUE));
  }

  try {
    client = await db.connect(req);
    const totalRooms = await roomDB.getCardsByUserId(client, user.userId);
    let ongoingRooms = totalRooms.filter((rawRoom) => rawRoom.status === 'ONGOING' && rawRoom.isOut === false);
    let completeRooms = totalRooms.filter((rawRoom) => rawRoom.status === 'COMPLETE' && rawRoom.isOut === false);
    let failRooms = totalRooms.filter((rawRoom) => rawRoom.status === 'FAIL' || rawRoom.isOut === true);

    const ongoingRoomNum = ongoingRooms.length;
    const completeRoomNum = completeRooms.length;
    const failRoomNum = failRooms.length;
    const totalRoomNum = ongoingRoomNum + completeRoomNum + failRoomNum;

    let rooms = [];
    let roomIds = [];

    if (roomType === 'ONGOING') {
      roomIds = ongoingRooms.map((room) => room.roomId);
      rooms = ongoingRooms;
      rooms = _.sortBy(rooms, 'startAt').reverse();
    } else if (roomType === 'COMPLETE') {
      roomIds = completeRooms.map((room) => room.roomId);
      rooms = completeRooms;
      rooms = _.sortBy(rooms, 'outAt').reverse();
    } else if (roomType === 'FAIL') {
      roomIds = failRooms.map((room) => room.roomId);
      rooms = failRooms;
      // 중도 퇴장으로 인한 미완료일 경우, end_date 보정
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.isOut) {
          room.endAt = room.outAt;
        }
      }
      rooms = _.sortBy(rooms, 'endAt').reverse();
    }

    if (lastId !== -1) {
      const lastIndex = _.indexOf(roomIds, lastId);
      // @error 1. 잘못된 last id
      if (lastIndex === -1) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_LASTID));
      }
      roomIds = roomIds.slice(lastIndex + 1, lastIndex + 1 + size);
      ongoingRooms = ongoingRooms.slice(lastIndex + 1, lastIndex + 1 + size);
    }
    // 최초 요청시
    else {
      roomIds = roomIds.slice(0, size);
      rooms = rooms.slice(0, size);
    }
    let roomData = [];

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const startDate = dayjs(room.startAt);
      const endDate = dayjs(room.endAt);
      const now = dayjs().add(9, 'hour');
      const today = dayjs(now.format('YYYY-MM-DD'));
      const leftDay = endDate.diff(today, 'day');
      const sparkCount = await sparkDB.countSparkByEntryId(client, room.entryId);
      let oneRoom = {
        roomId: room.roomId,
        roomName: room.roomName,
        leftDay,
        thumbnail: room.thumbnail,
        totalReceivedSpark: parseInt(sparkCount[0].count) ? parseInt(sparkCount[0].count) : 0,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        failDay: null,
        comment: room.comment,
      };
      if (roomType === 'FAIL') {
        const failDay = endDate.diff(startDate, 'day') + 1;
        oneRoom.failDay = failDay;
      }
      roomData.push(oneRoom);
    }

    const data = {
      nickname: user.nickname,
      totalRoomNum,
      ongoingRoomNum,
      completeRoomNum,
      failRoomNum,
      rooms: roomData,
    };
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_MYROOM_SUCCESS, data));
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
