const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const countLikeByRecordId = async (client, recordId) => {
  const { rows } = await client.query(
    `
      SELECT COUNT(*)
      FROM spark.like
      WHERE record_id = $1
      `,
    [recordId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const checkIsLike = async (client, recordId, userId) => {
  const { rows } = await client.query(
    `
        SELECT * FROM spark.like
        WHERE record_id = $1
        AND sender_id = $2
    `,
    [recordId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const sendLike = async (client, recordId, senderId) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
        INSERT INTO spark.like
        (record_id, sender_id, created_at)
        VALUES
        ($1, $2, $3)
        RETURNING *
    `,
    [recordId, senderId, now],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const cancelLike = async (client, recordId, senderId) => {
  const { rows } = await client.query(
    `
        DELETE FROM spark.like
        WHERE record_id = $1 
        AND sender_id = $2
        RETURNING *
    `,
    [recordId, senderId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  countLikeByRecordId,
  checkIsLike,
  sendLike,
  cancelLike,
};
