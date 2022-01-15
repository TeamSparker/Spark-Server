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

module.exports = { insertRecordById };
