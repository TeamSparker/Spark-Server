const dayjs = require('dayjs');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const insertOwnership = async (client, userId, filePath) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    INSERT INTO spark.ownership
    (user_id, file_path, created_at)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [userId, filePath, now],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getOwnFilesByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.ownership
    WHERE userId = $1
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows.map((r) => r.file_path));
};

module.exports = {
  insertOwnership,
  getOwnFilesByUserId,
};
