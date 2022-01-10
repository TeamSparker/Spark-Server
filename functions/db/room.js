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

module.exports = { addRoom, isCodeUnique, getRoomByCode, getEntriesByRoomId };
