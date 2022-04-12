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

const getOwnershipByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.ownership
    WHERE user_id = $1
    AND file_deleted = FALSE
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  insertOwnership,
  getOwnershipByUserId,
};
