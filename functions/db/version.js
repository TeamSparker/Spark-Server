const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecentVersion = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.version
    ORDER BY created_at DESC
    LIMIT 1
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getRecentVersion,
};
