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

const getRecentRecordByEntryId = async (client, entryId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.record
    WHERE entry_id = $1
    ORDER BY date desc
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

module.exports = {
  insertRecordById,
  getRecentRecordByEntryId,
  updateStatusByRecordId,
  uploadRecord,
};
