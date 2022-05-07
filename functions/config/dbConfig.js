const dotenv = require('dotenv');
dotenv.config();

let user = process.env.DEV_DB_USER;
let host = process.env.DEV_DB_HOST;
let database = process.env.DEV_DB_DB;
let password = process.env.DEV_DB_PASSWORD;

if (process.env.NODE_ENV === 'production') {
  user = process.env.DB_USER;
  host = process.env.DB_HOST;
  database = process.env.DB_DB;
  password = process.env.DB_PASSWORD;
}

module.exports = {
  user,
  host,
  database,
  password,
};
