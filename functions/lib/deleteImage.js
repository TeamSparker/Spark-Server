const admin = require('firebase-admin');
const { firebaseConfig } = require('../config/firebaseClient');

const deleteImageFromFirebase = async (filePath) => {
  await admin
    .storage()
    .bucket(firebaseConfig.storageBucket)
    .file('certification/' + filePath)
    .delete();
};

module.exports = {
  deleteImageFromFirebase,
};
