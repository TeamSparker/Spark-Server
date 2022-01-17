const admin = require('firebase-admin');
const serviceAccount = require('./we-sopt-spark-firebase-adminsdk-emnjd-30d5170309.json');
const dotenv = require('dotenv');
const scheduler = require('./scheduler/scheduler');

dotenv.config();

let firebase;
if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  firebase = admin.app();
}
const job = scheduler.job; 

module.exports = {
  api: require('./api'),
};
