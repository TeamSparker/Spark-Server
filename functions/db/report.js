const dayjs = require('dayjs');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const checkAlreadyReport = async (client, userId, recordId) => {
    const { rows } = await client.query(
        `
        SELECT *
        FROM spark.report
        WHERE user_id = $1
        AND record_id = $2
        `,
        [userId, recordId],
      );
    
      return convertSnakeToCamel.keysToCamel(rows[0]);
}

const addReport = async (client, userId, targetUserId, recordId) => {
    const { rows } = await client.query(
    `
    INSERT INTO spark.report
    (user_id, target_user_id, record_id)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [userId, targetUserId, recordId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
}

module.exports = {
    addReport,
    checkAlreadyReport,
};
