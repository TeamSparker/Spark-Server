const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecordById = async (client, recordId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.record
    WHERE record_id = $1
    `,
    [recordId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRecentRecordByEntryId = async (client, entryId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.record
    WHERE entry_id = $1
    ORDER BY record_id desc
    LIMIT 1
    `,
    [entryId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateStatusByRecordId = async (client, recordId, statusType) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.record
    SET status = $2, updated_at = $3
    WHERE record_id = $1
    RETURNING *
    `,
    [recordId, statusType, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const uploadRecord = async (client, recordId, certifyingImg, timerRecord) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.record
    SET certifying_img = $2, timer_record = $3, status = 'DONE', updated_at = $4, certified_at = $4
    WHERE record_id = $1
    RETURNING *
    `,
    [recordId, certifyingImg, timerRecord, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getPagedRecordsByEntryId = async (client, entryId, lastId, size) => {
  const now = dayjs().add(9, 'hour');
  const today = dayjs(now).format('YYYY-MM-DD');
  if (lastId === -1) {
    const { rows } = await client.query(
      `
      SELECT *
      FROM spark.record r
      WHERE r.entry_id = $1
      AND r.day != 0
      AND (r.status in ('DONE', 'REST') OR r.date != $3)
      ORDER BY r.day DESC
      LIMIT $2
      `,
      [entryId, size, today],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
    const { rows } = await client.query(
      `
      SELECT *
      FROM spark.record r
      WHERE r.entry_id = $1
      AND r.record_id < $2
      AND (r.status in ('DONE', 'REST') OR r.date != $4)
      ORDER BY r.day DESC
      LIMIT $3
      `,
      [entryId, lastId, size, today],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  }
};

const getDonePagedRecordsByEntryId = async (client, entryId, lastId, size) => {
  const now = dayjs().add(9, 'hour');
  const today = dayjs(now).format('YYYY-MM-DD');
  if (lastId === -1) {
    const { rows } = await client.query(
      `
      SELECT *
      FROM spark.record r
      WHERE r.entry_id = $1
      AND r.day != 0
      AND r.status = 'DONE'
      ORDER BY r.day DESC
      LIMIT $2
      `,
      [entryId, size],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  } else {
    const { rows } = await client.query(
      `
      SELECT *
      FROM spark.record r
      WHERE r.entry_id = $1
      AND r.record_id < $2
      AND r.status = 'DONE'
      ORDER BY r.day DESC
      LIMIT $3
      `,
      [entryId, lastId, size],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  }
};

const insertRecords = async (client, insertEntries) => {
  const { rows } = await client.query(
    `
    INSERT INTO spark.record
    (entry_id, date, day)
    VALUES
    ${insertEntries.join()}
    RETURNING *
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getNoneOrConsiderEntryIdsByDate = async (client, date) => {
  const { rows } = await client.query(
    `
      SELECT entry_id FROM spark.record
      WHERE date = $1
      AND status IN ('NONE', 'CONSIDER')
    `,
    [date],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPushRemindUsers = async (client, date) => {
  const { rows } = await client.query(
    `
    SELECT e.user_id, r.room_name, r.room_id, rec.status, u.device_token
    FROM spark.entry e
    INNER JOIN spark.room r
    ON  e.room_id = r.room_id
    INNER JOIN spark.record rec
    ON rec.entry_id = e.entry_id
    INNER JOIN spark.user u
    ON u.user_id = e.user_id
    WHERE e.is_out = FALSE
    AND e.is_deleted = FALSE
    AND e.is_kicked = FALSE
    AND u.is_deleted = FALSE
    AND u.push_remind = TRUE
    AND rec.date = $1
    AND e.room_id IN (
        SELECT DISTINCT e.room_id FROM spark.entry e
        INNER JOIN spark.record r
        ON e.entry_id = r.entry_id
        WHERE r.date = $1
        AND r.status IN ('NONE', 'CONSIDER')
        AND e.is_kicked = FALSE
        AND e.is_deleted = FALSE
        AND e.is_kicked = FALSE
    )    
    `,
    [date],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getRecordById,
  getRecentRecordByEntryId,
  updateStatusByRecordId,
  uploadRecord,
  getPagedRecordsByEntryId,
  getDonePagedRecordsByEntryId,
  insertRecords,
  getNoneOrConsiderEntryIdsByDate,
  getPushRemindUsers,
};
