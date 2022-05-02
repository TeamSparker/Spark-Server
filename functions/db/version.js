const dayjs = require('dayjs');
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

const updateRecentVersion = async (client, newVersion) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    INSERT INTO spark.version
    (version, created_at)
    VALUES
    ($1, $2)
    RETURNING *
    `,
    [newVersion, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getRecentVersion,
  updateRecentVersion,
};
