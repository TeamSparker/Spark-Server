const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const convertDay = require('../../../constants/day');
const db = require('../../../db/db');
const { userDB, roomDB, sparkDB, likeDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers');
const slackAPI = require('../../../middlewares/slackAPI');
const dayjs = require('dayjs');
const { filter } = require('lodash');
const _ = require('lodash');

/**
 *  @피드_조회
 *  @route GET /feed?lastid=&size=
 *  @error
 *    1. 잘못된 lastid
 */

module.exports = async (req, res) => {
  const lastid = Number(req.query.lastid);
  const size = Number(req.query.size);
  const user = req.user;

  let client;

  try {
    client = await db.connect(req);
    const rawRooms = await roomDB.getRoomsByUserId(client, user.userId);
    
    if(!rawRooms.length){
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_FEED_SUCCES, { "records": [] }));
    }
    const roomIds = [...new Set(rawRooms.filter(Boolean).map((room) => room.roomId))];
    const allRecords = await roomDB.getRecordsByRoomIds(client, roomIds);
    const allRecordIds = allRecords.map((record) => record.recordId);

    let responseRecords = [];
    let recordIds = [];
    // 최초 요청이 아닐시
    if (lastid !== -1) {
      const lastIndex = _.indexOf(allRecordIds, lastid);
      // @error 1. 잘못된 last id
      if (lastIndex === -1) {
        return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.INVALID_LASTID));
      }
      responseRecords = allRecords.slice(lastIndex+1, lastIndex+1+size);
      recordIds = allRecordIds.slice(lastIndex+1, lastIndex+1+size);
    }
    else {
      responseRecords = allRecords.slice(0, size);
      recordIds = allRecordIds.slice(0, size);
    }
    if(!recordIds.length) {
        return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_FEED_SUCCES, { "records": [] }));
    }
    let likeNums = [];
    let sparkNums = [];
    let isLikes = [];
    for(let i=0; i<recordIds.length; i++) {
      const like = await likeDB.countLikeByRecordId(client, recordIds[i]);
      const isLike = await likeDB.checkIsLike(client, recordIds[i], user.userId);
      likeNums.push(Number(like[0].count));
      if (isLike) {
          isLikes.push(true);
      }
      else {
          isLikes.push(false);
      }
      const spark = await sparkDB.countSparkByRecordId(client, recordIds[i]);
      sparkNums.push(Number(spark[0].count));
    }

    let records = [];
    for(let i=0; i<recordIds.length; i++) {
      const date = dayjs(responseRecords[i].date).format("YYYY-MM-DD");
      const day = convertDay.numToString[dayjs(responseRecords[i].date).day()];
      records.push({
          date,
          day,
          userId: responseRecords[i].userId,
          recordId: recordIds[i], 
          nickname: responseRecords[i].nickname,
          profileImg: responseRecords[i].profileImg,
          roomName: responseRecords[i].roomName,
          certifyingImg: responseRecords[i].certifyingImg,
          likeNum: likeNums[i],
          sparkCount: sparkNums[i],
          isLiked: isLikes[i],
          timerRecord: responseRecords[i].timerRecord
      });
    }
    
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.GET_FEED_SUCCES, { records }));

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