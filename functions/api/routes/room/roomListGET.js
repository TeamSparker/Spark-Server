const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { roomDB } = require('../../../db');
const slackAPI = require('../../../middlewares/slackAPI');
const dayjs = require('dayjs');
const _ = require('lodash');

/**
 *  @습관방_리스트_조회
 *  @route GET /room?lastId=&size=
 *  @error
 *    1. lastId 또는 size 값이 전달되지 않음
 *    2. 잘못된 lastId
 */

module.exports = async (req, res) => {
  const lastId = Number(req.query.lastId);
  const size = Number(req.query.size);
  const user = req.user;

  // @error 1. lastId 또는 size 값이 전달되지 않음
  if (!lastId || !size) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const rawRooms = await roomDB.getRoomsByUserId(client, user.userId);

    let waitingRooms = rawRooms.filter((rawRoom) => rawRoom.status === 'NONE');
    waitingRooms = _.sortBy(waitingRooms, 'createdAt').reverse(); // 최근에 생성된 대기방이 위로
    let ongoingRooms = rawRooms.filter((rawRoom) => rawRoom.status === 'ONGOING');
    ongoingRooms = _.sortBy(ongoingRooms, 'startAt').reverse(); // 최근에 시작한 습관방이 위로

    const waitingRoomIds = [...new Set(waitingRooms.filter(Boolean).map((room) => room.roomId))];
    const ongoingRoomIds = [...new Set(ongoingRooms.filter(Boolean).map((room) => room.roomId))];
    const roomIds = waitingRoomIds.concat(ongoingRoomIds);
    console.log('waitingRoomIds', waitingRoomIds);
    console.log('ongoingRoomIds', ongoingRoomIds);
    console.log('roomIds', roomIds);
    let responseRoomIds = [];

    // 최초 요청이 아닐시
    if (lastId !== -1) {
      const lastIndex = _.indexOf(roomIds, lastId);
      // @error 2. 잘못된 last Id
      if (lastIndex === -1) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_LASTID));
      }
      responseRoomIds = roomIds.slice(lastIndex + 1, lastIndex + 1 + size);
    }
    // 최초 요청시
    else {
      responseRoomIds = roomIds.slice(0, size);
    }

    console.log('responseRoomIds', responseRoomIds);

    // 마지막일 때 -> 빈 배열 return
    if (!responseRoomIds.length) {
      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ROOM_LIST_SUCCESS, { rooms: [] }));
    }

    const rawRoomInfo = await roomDB.getRoomsByIds(client, responseRoomIds);
    const roomInfo = rawRoomInfo.sort((a, b) => responseRoomIds.indexOf(a.roomId) - responseRoomIds.indexOf(b.roomId));
    const today = dayjs(dayjs().add(9, 'hour').format('YYYY-M-D'));

    // roomIds 빈 배열일 때 처리
    const rawProfiles = await roomDB.getUserProfilesByRoomIds(client, responseRoomIds, today);
    const profiles = rawProfiles.sort((a, b) => responseRoomIds.indexOf(a.roomId) - responseRoomIds.indexOf(b.roomId));
    console.log(
      'profiles',
      profiles.map((o) => o.roomId),
    );

    let roomProfileImg = [];
    let roomMemberNum = [];
    let roomUserStatus = [];
    let roomDoneMemberNum = [];

    responseRoomIds.map((roomId) => {
      const userStatus = profiles.filter(Boolean).filter((o) => {
        if (o.roomId === roomId && o.userId === user.userId) {
          return true;
        }
        return false;
      });

      roomUserStatus.push(userStatus[0].status);

      const doneMembers = profiles.filter(Boolean).filter((o) => {
        if (o.roomId === roomId && (o.status === 'REST' || o.status === 'DONE')) {
          return true;
        }
        return false;
      });
      roomDoneMemberNum.push(doneMembers.length);

      let profileImgs = profiles
        .filter(Boolean)
        .filter((o) => o.roomId === roomId)
        .map((o) => o.profileImg);
      roomMemberNum.push(profileImgs.length);
      if (profileImgs.length < 3) {
        let i = 0;
        const length = profileImgs.length;

        for (let i = 0; i < 3 - length; i++) {
          profileImgs.push(null);
        }
      } else {
        profileImgs = profileImgs.slice(0, 3);
      }
      roomProfileImg.push(profileImgs);
    });

    let rooms = [];
    for (let i = 0; i < responseRoomIds.length; i++) {
      const endDate = dayjs(roomInfo[i].endAt);
      const leftDay = endDate.diff(today, 'day');
      const room = {
        roomId: roomInfo[i].roomId,
        roomName: roomInfo[i].roomName,
        leftDay,
        profileImg: roomProfileImg[i],
        life: roomInfo[i].life,
        isStarted: roomInfo[i].status === 'NONE' ? false : true,
        myStatus: roomUserStatus[i],
        memberNum: roomMemberNum[i],
        doneMemberNum: roomDoneMemberNum[i],
      };
      rooms.push(room);
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ROOM_LIST_SUCCESS, { rooms }));
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
