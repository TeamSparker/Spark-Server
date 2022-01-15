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
        [recordId, userId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
}

module.exports = { 
    countLikeByRecordId,
    checkIsLike,
};

