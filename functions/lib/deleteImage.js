const admin = require('firebase-admin');
const { firebaseConfig } = require('../config/firebaseClient');
const { ownershipDB } = require('../db');

const deleteFirebaseImage = async (filePath) => {
  await admin.storage().bucket(firebaseConfig.storageBucket).file(filePath).delete();
};

const deleteFirebaseImageByUserId = async (client, userId) => {
  const ownership = await ownershipDB.getOwnershipByUserId(client, userId);
  for (let i = 0; i < ownership.length; i++) {
    deleteFirebaseImage(ownership[i].filePath);
  }
};

module.exports = {
  deleteFirebaseImage,
  deleteFirebaseImageByUserId,
};
