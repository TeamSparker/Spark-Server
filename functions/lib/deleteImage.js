const admin = require('firebase-admin');
const { firebaseConfig } = require('../config/firebaseClient');
const { ownershipDB } = require('../db');

const deleteFirebaseImage = async (filePath) => {
  const fileName = filePath.split('.')[0];
  const fileExtension = filePath.split('.')[1];
  await admin.storage().bucket(firebaseConfig.storageBucket).file(`${fileName}.${fileExtension}`).delete();
  await admin.storage().bucket(firebaseConfig.storageBucket).file(`${fileName}_270x270.${fileExtension}`).delete();
  await admin.storage().bucket(firebaseConfig.storageBucket).file(`${fileName}_360x360.${fileExtension}`).delete();
  await admin.storage().bucket(firebaseConfig.storageBucket).file(`${fileName}_720x720.${fileExtension}`).delete();
};

const deleteFirebaseImageByUserId = async (client, userId) => {
  const ownership = await ownershipDB.getOwnershipByUserId(client, userId);
  for (let i = 0; i < ownership.length; i++) {
    await deleteFirebaseImage(ownership[i].filePath);
  }
  await ownershipDB.deleteAllOwnershipByUserId(client, userId);
};

module.exports = {
  deleteFirebaseImage,
  deleteFirebaseImageByUserId,
};
