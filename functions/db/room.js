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

const getRoomsByIds = async (client, roomIds) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.room
    WHERE room_id IN (${roomIds.join()})
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
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

const getCardsByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry e
    INNER JOIN spark.room r
    ON r.room_id = e.room_id
    WHERE e.user_id = $1
    AND e.is_out = FALSE
    AND e.is_kicked = FALSE
    AND e.is_deleted = FALSE
    AND NOT e.thumbnail IS null
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

const getEntriesByRoomIds = async (client, roomIds) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.entry e
    LEFT JOIN spark.room r
    ON r.room_id = e.room_id
    WHERE e.room_id IN (${roomIds.join()})
      AND e.is_out = FALSE
      AND e.is_kicked = FALSE
      AND e.is_deleted = FALSE
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserProfilesByRoomIds = async (client, roomIds, today) => {
  const { rows } = await client.query(
    `
    SELECT *
    FROM spark.entry e
    INNER JOIN spark.user u
    ON u.user_id = e.user_id
    LEFT JOIN spark.record r
    ON e.entry_id = r.entry_id AND r.date = $1 
    WHERE e.room_id in (${roomIds.join()})
    AND e.is_out = FALSE
    AND e.is_kicked = FALSE
    AND e.is_deleted = FALSE
    AND u.is_deleted = FALSE
    ORDER BY e.created_at
    `,
    [today],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecordsByRoomIds = async (client, roomIds) => {
  const { rows } = await client.query(
    `
    SELECT *
    FROM spark.entry e
    INNER JOIN spark.user u
    ON u.user_id = e.user_id
    LEFT JOIN spark.record r
    ON e.entry_id = r.entry_id
    WHERE e.room_id in (${roomIds.join()})
    AND e.is_out = FALSE
    AND e.is_kicked = FALSE
    AND e.is_deleted = FALSE
    AND u.is_deleted = FALSE
    AND NOT r.certified_at IS null
    ORDER BY r.date DESC, r.certified_at DESC
    `,
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
    [roomId, day],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecordById = async (client, recordId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.record r
    INNER JOIN spark.entry e
    ON r.entry_id = e.entry_id
    WHERE r.record_id = $1
      AND e.is_out = FALSE
      AND e.is_kicked = FALSE
      AND e.is_deleted = FALSE
      AND r.is_deleted = FALSE
    ORDER BY e.created_at
    `,
    [recordId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
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

const startRoomById = async (client, roomId) => {
  const now = dayjs().add(9, 'hour');
  const startAt = now.startOf('d');
  const endAt = now.add(66, 'day').startOf('d');
  console.log(endAt.diff(startAt, 'd'));
  const { rows } = await client.query(
    `
    UPDATE spark.room
    SET status = 'ONGOING', updated_at = $2, start_at = $3, end_at = $4
    WHERE room_id = $1
    AND status != 'ONGOING'
    RETURNING *
    `,
    [roomId, now, startAt, endAt],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getFailRecords = async (client) => {
  const now = dayjs().add(9, 'hour');
  const yesterday = dayjs(now.subtract(1, 'day').format('YYYY-MM-DD'));
  const { rows } = await client.query(
    `
    SELECT e.room_id, COUNT(r.record_id) AS fail_count
    FROM spark.entry e
    LEFT JOIN spark.record r
    ON e.entry_id = r.entry_id
    LEFT JOIN spark.room room
    ON e.room_id = room.room_id
    WHERE room.status = 'ONGOING'
    AND e.is_out = FALSE
    AND e.is_kicked = FALSE
    AND e.is_deleted = FALSE
    AND r.day != 0
    AND r.status IN ('NONE', 'CONSIDER')
    AND r.date = $1
    GROUP BY e.room_id
    `,
    [yesterday]
  );
  return convertSnakeToCamel.keysToCamel(rows);
}

const updateLife = async(client, failCount, roomIds) => {
  const now = dayjs().add(9, 'hour');
  const yesterday = dayjs(now.subtract(1, 'day').format('YYYY-MM-DD'));
    const { rows } = await client.query(
      `
      UPDATE spark.room
      SET end_at =
      CASE
      WHEN life > $1 THEN end_at
      ELSE $2
      END,
      status =
      CASE
      WHEN life > $1 THEN status
      ELSE 'FAIL'
      END,
      life =
      CASE
      WHEN life > $1 THEN life - $1
      ELSE 0
      END
      WHERE room_id IN (${roomIds.join()}) 
      RETURNING room_id, life
      `,
      [failCount, yesterday]
    );
    return convertSnakeToCamel.keysToCamel(rows);
}

const updateThumbnail = async(client, entryId, img) => {
    const { rows } = await client.query(
      `
      UPDATE spark.entry e
      SET thumbnail = $2
      WHERE entry_id = $1
      `,
      [entryId, img]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = { 
  addRoom, 
  isCodeUnique, 
  getRoomById, 
  getRoomsByIds,
  getRoomByCode,
  getEntriesByRoomId,
  getRoomsByUserId,
  getUserProfilesByRoomIds,
  kickedHistoryByIds,
  getEntryByIds,
  updatePurposeByEntryId,
  getRecordsByDay,
  checkEnteredById,
  enterById,
  getFriendsByIds,
  startRoomById,
  getRecordsByRoomIds,
  getRecordById,
  getCardsByUserId,
  updateLife,
  getFailRecords,
  getEntriesByRoomIds,
  updateThumbnail
};
