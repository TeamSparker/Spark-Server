const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const countSparkByRecordId = async (client, recordId) => {
    const { rows } = await client.query(
      `
      SELECT COUNT(*)
      FROM spark.spark
      WHERE record_id = $1
      `,
      [recordId],
    );
    return convertSnakeToCamel.keysToCamel(rows);
  };

  const insertSpark = async (client, recordId, senderId, content) => {
    const { rows } = await client.query(
      `
      INSERT INTO spark.spark
      (record_id, sender_id, content)
      VALUES
      ($1, $2, $3)
      RETURNING *
      `,
      [recordId, senderId, content],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  }
module.exports = { 
  countSparkByRecordId,
  insertSpark
};

