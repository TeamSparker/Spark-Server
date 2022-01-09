const admin = require("firebase-admin");
const serviceAccount = require("./we-sopt-29-firebase-adminsdk-xs1o9-0bc9bc55ea");
const dotenv = require("dotenv");

dotenv.config();

let firebase;
if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  firebase = admin.app();
}

module.exports = {
  api: require("./api"),
};
