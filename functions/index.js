const admin = require('firebase-admin');
const serviceAccount = require('./we-sopt-spark-firebase-adminsdk-emnjd-30d5170309.json');
const dotenv = require('dotenv');
const dayjs = require('dayjs');
const scheduler = require('./scheduler/scheduler');
const schedule = require('node-schedule');

// const job = schedule.scheduleJob('1,5,11,15,21,25,31,35,41,45,51,55 * * * * *', function() {
//   console.log(dayjs());  
//   console.log("hi");
// });

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
