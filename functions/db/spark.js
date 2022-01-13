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

module.exports = { countSparkByRecordId };

