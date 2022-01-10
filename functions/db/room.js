const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllRooms = async (client, limit, offset) => {
    const { rows } = await client.query(
        /* 
         * 1. roomDB에서 모든 room에 대한 roomId, roomName, start_at, end_at, life 를 가져옴.
         * 2. start_at, end_at 을 계산해서 leftDay를 가져옴.
         * 3. recordDB에서 모든 room에 대한 roomId, roomName, start_at, end_at, life 를 가져옴.
         */
      `
      SELECT room_id, room_name, start_at, end_at, life
      FROM spark.room r
      WHERE is_deleted = FALSE
      `,
      [limit, offset],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  const entryCount = async (client) => {
    const { rows } = await client.query(
        /**
         * @참가자_인원_카운트
         */
      `
      SELECT count entry_id
      FROM spark.entry e
      WHERE is_deleted = FALSE
      `,
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  const roomCount = async (client) => {
    const { rows } = await client.query(
        /**
         * @습관방_개수_카운트
         */
      `
      SELECT count room_id
      FROM spark.room r
      WHERE is_deleted = FALSE
      `,
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  const getIsDoneFromRecord = async (client) => {
    const { rows } = await client.query(
        /**
         * @인증완료_여부_확인
         */
      `
      SELECT is_done
      FROM spark.record re
      WHERE is_deleted = FALSE
      `,
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  const getIsNoticeFromNotification = async (client) => {
    const { rows } = await client.query(
        /**
         * @읽지않은_알림_유무_확인
         */
      `
      SELECT is_notice
      FROM spark.notification n
      WHERE is_deleted = FALSE
      `,
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  const getProfileImg = async (client) => {
    const { rows } = await client.query(
        /**
         * @프로필사진_불러오기
         */
      `
      SELECT profile_img
      FROM spark.user u
      WHERE is_deleted = FALSE
      `,
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  const getRooomByIds = async (client, limit, offset) => {
    const { rows } = await client.query(
        /* 
         * 1. roomDB에서 모든 room에 대한 roomId, roomName, start_at, end_at, life 를 가져옴.
         * 2. start_at, end_at 을 계산해서 leftDay를 가져옴.
         * 3. recordDB에서 모든 room에 대한 roomId, roomName, start_at, end_at, life 를 가져옴.
         */
      `
      SELECT room_id, room_name, start_at, end_at, life
      FROM spark.room r
      WHERE is_deleted = FALSE
      `,
      [limit, offset],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  // roomId, roomName, leftDay, profileImg, life, isDone, memberNum, doneMemberNum, isNotice, totalRoomNum
  // room r, record re, user u, entry e, notification n
module.exports = { getAllRooms, entryCount, roomCount,getIsDoneFromRecord,getIsNoticeFromNotification, getProfileImg };