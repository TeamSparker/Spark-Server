const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const insertRecordById = async (client, entryId, roomStartAt) => {
  const now = dayjs().add(9, 'hour');
  const today = now.startOf('d');
  const day = today.diff(roomStartAt, 'd');
  const { rows } = await client.query(
    `
    INSERT INTO spark.record
    (entry_id, date, day)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [entryId, today, day],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

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
  if (lastId === -1) {
    const { rows } = await client.query(
      `
      SELECT *
      FROM spark.record r
      WHERE r.entry_id = $1
      AND r.day != 0
      AND r.status in ('DONE', 'REST')
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
      AND r.status in ('DONE', 'REST')
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
    ${insertEntries.join(',')}
    RETURNING *
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  insertRecordById,
  getRecordById,
  getRecentRecordByEntryId,
  updateStatusByRecordId,
  uploadRecord,
  getPagedRecordsByEntryId,
  insertRecords,
};
