const admin = require('firebase-admin');
const functions = require('firebase-functions');
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const dayjs = require('dayjs');
const db = require('../db/db');
const { ownershipDB } = require('../db');
const { firebaseConfig } = require('../config/firebaseClient');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const slackAPI = require('./slackAPI');

const uploadImageIntoSubDir = (subDir) => {
  return function (req, res, next) {
    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName = {};
    let imagesToUpload = [];
    let imageToAdd = {};
    let imageUrls = [];
    let filePaths = [];

    let fields = {};

    // req.body로 들어오는 key:value 페어들을 처리
    busboy.on('field', (fieldName, val) => {
      fields[fieldName] = val;
    });

    // req.body로 들어오는 게 파일일 경우 처리
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        const slackMessage = `[Image Upload File Type Exception]\n [${req.user.nickname} (${req.user.userId})] tried to upload ${mimetype} file`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);

        return res.status(400).json({ error: 'Wrong file type submitted' });
      }
      // my.image.png => ['my', 'image', 'png']
      const imageExtension = filename.split('.')[filename.split('.').length - 1];
      // 32756238461724837.png
      imageFileName = `${dayjs().format('YYYYMMDD_HHmmss_')}${Math.round(Math.random() * 1000000000000).toString()}.${imageExtension}`;
      const filepath = path.join(os.tmpdir(), imageFileName);
      imageToAdd = { imageFileName, filepath, mimetype };
      file.pipe(fs.createWriteStream(filepath));
      imagesToUpload.push(imageToAdd);
    });

    // req.body로 들어온 파일들을 Firebase Storage에 업로드
    busboy.on('finish', async () => {
      let promises = [];
      imagesToUpload.forEach((imageToBeUploaded) => {
        imageUrls.push(`https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${subDir}%2F${imageToBeUploaded.imageFileName}?alt=media`);
        filePaths.push(`${subDir}/${imageToBeUploaded.imageFileName}`);
        promises.push(
          admin
            .storage()
            .bucket(firebaseConfig.storageBucket)
            .upload(imageToBeUploaded.filepath, {
              destination: `${subDir}/${imageToBeUploaded.filepath.split('/').slice(-1)[0]}`,
              resumable: false,
              metadata: {
                metadata: {
                  contentType: imageToBeUploaded.mimetype,
                },
              },
            }),
        );
      });

      let client;
      try {
        // File에 대한 Ownership 등록
        client = await db.connect(req);
        for (let i = 0; i < filePaths.length; i++) {
          await ownershipDB.insertOwnership(client, req.user.userId, filePaths[i]);
        }

        await Promise.all(promises);
        req.body = fields;
        req.imageUrls = imageUrls;
        next();
      } catch (err) {
        console.error(err);
        functions.logger.error(`[FILE UPLOAD ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`);

        const slackMessage = `[ERROR BY ${req.user.nickname} (${req.user.userId})] [${req.method.toUpperCase()}] ${req.originalUrl} ${err} ${JSON.stringify(err)}`;
        slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
        return res.status(500).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
      } finally {
        client.release();
      }
    });

    busboy.end(req.rawBody);
  };
};
module.exports = uploadImageIntoSubDir;
