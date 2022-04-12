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

const deleteAllOwnershipByUserId = async (client, userId) => {
  const now = dayjs().add(9, 'hour');
  const { rows } = await client.query(
    `
    UPDATE spark.ownership
    SET file_deleted = true, file_deleted_at = $2
    WHERE user_id = $1
    RETURNING *
    `,
    [userId, now],
  );
  return convertSnakeToCamel.keysToCamel(rows);
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
  deleteAllOwnershipByUserId,
  getOwnershipByUserId,
};
