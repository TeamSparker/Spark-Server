const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addRoom = async (client, roomName, code, creator, fromStart) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.room as r
    (room_name, code, creator, from_start)
    VALUES
    ($1, $2, $3, $4)
    RETURNING *
    `,
    [roomName, code, creator, fromStart],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const isCodeUnique = async (client, code) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.room as r
    WHERE code = $1
      AND is_deleted = FALSE
    `,
    [code],
  );
  if (rows.length == 0) {
    return true;
  }
  return false;
};

const getRoomById = async (client, roomId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.room
    WHERE room_id = $1
      AND is_deleted = FALSE
    `,
    [roomId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRoomByCode = async (client, code) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.room
    WHERE code = $1
      AND is_deleted = FALSE
    `,
    [code],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getEntriesByRoomId = async (client, roomId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry
    WHERE room_id = $1
      AND is_out = FALSE
      AND is_kicked = FALSE
      AND is_deleted = FALSE
      ORDER BY created_at
    `,
    [roomId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const kickedHistoryByIds = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry
    WHERE room_id = $1
      AND user_id = $2
      AND is_deleted = FALSE
      AND is_kicked = TRUE
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getEntryByIds = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry
    WHERE room_id = $1
      AND user_id = $2
      AND is_deleted = FALSE
      AND is_out = FALSE
      AND is_kicked = FALSE
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updatePurposeByEntryId = async (client, entryId, moment, purpose) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.entry
    SET moment = $2, purpose = $3, updated_at = $4
    WHERE entry_id = $1
    RETURNING *
    `,
    [entryId, moment, purpose, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getFriendsByIds = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry
    WHERE room_id = $1
      AND user_id != $2
      AND is_deleted = FALSE
      AND is_out = FALSE
      AND is_kicked = FALSE
      ORDER BY created_at
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { addRoom, isCodeUnique, getRoomById, getRoomByCode, getEntriesByRoomId, kickedHistoryByIds, getEntryByIds, updatePurposeByEntryId, getFriendsByIds };
