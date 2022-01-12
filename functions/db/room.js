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

const kickedHistoryByRoomIdAndUserId = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry
    WHERE room_id = $1
      AND user_id = $2
      AND is_kicked = TRUE
      AND is_deleted = FALSE
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const checkEnteredById = async (client, roomId, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry
    WHERE room_id = $1
      AND user_id = $2
      AND is_out = FALSE
      AND is_deleted = FALSE
    `,
    [roomId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const enterById = async (client, roomId, userId) => {
  const now = dayjs().add(9, 'hour');

  // 해당 방에 들어왔다 나간적이 있는지 확인
  const { rows } = await client.query(
    `
    SELECT count(*) FROM spark.entry
    WHERE room_id = $1
      AND user_id = $2
      AND is_out = TRUE
      AND is_deleted = FALSE
    `,
    [roomId, userId],
  );

  const isOutBefore = !!parseInt(rows[0].count);

  // 들어왔다 나간적이 있다면 UPDATE Query
  if (isOutBefore) {
    const { rows } = await client.query(
      `
      UPDATE spark.entry
      SET is_out = FALSE, updated_at = $3
      WHERE room_id = $1
      AND user_id = $2
      AND is_out = TRUE
      AND is_deleted = FALSE
      RETURNING *
      `,
      [roomId, userId, now],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  }
  // 들어왔다 나간적이 없다면 INSERT Query
  else {
    const { rows } = await client.query(
      `
      INSERT INTO spark.entry
      (room_id, user_id)
      VALUES
      ($1, $2)
      RETURNING *
      `,
      [roomId, userId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  }
};

module.exports = { addRoom, isCodeUnique, getRoomById, getRoomByCode, getEntriesByRoomId, kickedHistoryByRoomIdAndUserId, checkEnteredById, enterById };
