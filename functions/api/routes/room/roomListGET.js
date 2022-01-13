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

/**
 *  @습관방_리스트_조회
 *  @route GET /room?lastid=&size=
 *  @error
 */

module.exports = async (req, res) => {
  const user = req.user;
  console.log(user.userId);

  let client;

  try {
    client = await db.connect(req);
    
    const rooms = await roomDB.getRoomsByUserId(client, user.userId);

    const roomIds = [...new Set(rooms.filter(Boolean).map((room) => room.roomId))];
    // console.log(roomIds);
    const profiles = await roomDB.getUserProfilesByRoomIds(client, roomIds);
    // console.log(profiles);
    let roomProfileImg = [];
    let roomMemberNum = [];
    roomIds.map((roomId) => {
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

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_ROOM_DETAIL_SUCCESS, {roomIds, roomProfileImg, roomMemberNum }));

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