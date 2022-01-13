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

const getRoomsByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry e
    INNER JOIN spark.room r
    ON r.room_id = e.room_id
    WHERE e.user_id = $1
    AND e.is_out = FALSE
    AND e.is_kicked = FALSE
    AND e.is_deleted = FALSE
    ORDER BY r.start_at
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
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

const getUserProfilesByRoomIds = async (client, roomIds) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry e
    INNER JOIN spark.user u
    ON u.user_id = e.user_id
    WHERE e.room_id in (${roomIds.join()})
    AND e.is_out = FALSE
    AND e.is_kicked = FALSE
    AND e.is_deleted = FALSE
    AND u.is_deleted = FALSE
    ORDER BY e.created_at
    `
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

const getRecordsByDay = async (client, roomId, day) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry e
    INNER JOIN spark.record r
    ON r.entry_id = e.entry_id
    INNER JOIN spark.user u
    ON e.user_id = u.user_id
    WHERE e.room_id = $1
      AND e.is_out = FALSE
      AND e.is_kicked = FALSE
      AND e.is_deleted = FALSE
      AND r.is_deleted = FALSE
      AND r.day = $2
    ORDER BY e.created_at
    `,
    [roomId,day]
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { addRoom, isCodeUnique, getRoomByCode, getRoomById, getEntriesByRoomId, kickedHistoryByIds, getEntryByIds, updatePurposeByEntryId, getRecordsByDay, getRoomsByUserId, getUserProfilesByRoomIds };
