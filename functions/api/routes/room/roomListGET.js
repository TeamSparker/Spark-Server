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
const { filter } = require('lodash');
const _ = require('lodash');
const roomPOST = require('./roomPOST');

/**
 *  @습관방_리스트_조회
 *  @route GET /room?lastid=&size=
 *  @error
 *    1. 잘못된 lastid
 */

module.exports = async (req, res) => {
  const lastid = Number(req.query.lastid);
  const size = Number(req.query.size);
  console.log(lastid, size);
  const user = req.user;
  console.log(user.userId);

  let client;

  try {
    client = await db.connect(req);

    const rawRooms = await roomDB.getRoomsByUserId(client, user.userId);

    const waitingRooms = rawRooms.filter((rawRoom) => rawRoom.status === "NONE");
    const ongoingRooms = rawRooms.filter((rawRoom) => rawRoom.status === "ONGOING");
    
    const waitingRoomIds = [...new Set(waitingRooms.filter(Boolean).map((room) => room.roomId))];
    const ongoingRoomIds = [...new Set(ongoingRooms.filter(Boolean).map((room) => room.roomId))];
    const roomIds = waitingRoomIds.concat(ongoingRoomIds);
    let responseRoomIds = [];
    
    // 최초 요청이 아닐시
    if(lastid !== -1) {
      const lastIndex = _.indexOf(roomIds, lastid);
      // @error 1. 잘못된 last id
      if (lastIndex === -1) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_LASTID));
      }
      responseRoomIds = roomIds.slice(lastIndex+1, lastIndex+1+size);
    }
    // 최초 요청시
    else {
      responseRoomIds = roomIds.slice(0, size);
    }

    console.log("responseRoomIds",responseRoomIds);

    // 마지막일 때 -> 빈 배열 return
    if(!responseRoomIds.length) {
      res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ROOM_LIST_SUCCESS, { "rooms": [] }));
    }

    const roomInfo = await roomDB.getRoomsByIds(client, responseRoomIds);

    const today = dayjs(dayjs().add(9, 'hour').format('YYYY-MM-DD'));

    // roomIds 빈 배열일 때 처리
    const profiles = await roomDB.getUserProfilesByRoomIds(client, responseRoomIds, today);

    // console.log(profiles);
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
      if (userStatus === 'DONE') {
        roomUserStatus.push(true);
      }
      else {
        roomUserStatus.push(false);
      }

      const doneMembers = profiles.filter(Boolean).filter((o) => {
        if (o.roomId === roomId && o.status === "DONE") {
          return true;
        }
        return false;
      });
      roomDoneMemberNum.push(doneMembers.length);

      let profileImgs = profiles.filter(Boolean).filter((o) => o.roomId === roomId).map((o) => o.profileImg);
      roomMemberNum.push(profileImgs.length);
      if(profileImgs.length < 3) {
        console.log("length", profileImgs.length);
        for(let i=0; i<3 - profileImgs.length; i++) {
          profileImgs.push(null);
        }
      }
      else {
        profileImgs = profileImgs.slice(0,3);
      }
      roomProfileImg.push(profileImgs);
    });
       
    let rooms = [];
    console.log("roomInfo", roomInfo);
    for (let i=0; i<responseRoomIds.length ; i++) {
      
      const endDate = dayjs(roomInfo[i].endAt);
      const leftDay = endDate.diff(today, 'day');
      let isStarted = true;
      if (roomInfo[i] === 'NONE') {
        isStarted = false;
      }
      const room = {
        roomId: roomInfo[i].roomId,
        roomName: roomInfo[i].roomName,
        leftDay,
        profileImg: roomProfileImg[i],
        life: roomInfo[i].life,
        isStarted,
        isDone: roomUserStatus[i],
        memberNum: roomMemberNum[i],
        doneMemberNum: roomDoneMemberNum[i]
      }
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