const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllUsers = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.user as u
    WHERE is_deleted = FALSE
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM spark.user as u
    WHERE user_id = $1
      AND is_deleted = FALSE
    `,
    // client.query()의 두 번째 파라미터에는, 쿼리문에 집어넣고 싶은 변수들의 배열을 적습니다.
    // $1에는 배열의 첫번째 변수가, $2에는 배열의 두 번째 변수... 이런 식으로 쿼리문에 변수가 들어가게 됩니다!
    [userId],
  );
  // 위의 getAllUsers와는 달리, 이번에는 유저 하나만 가져오고 싶기 때문에 rows[0]만 리턴해 줍니다.
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getAllUsers, getUserById };
