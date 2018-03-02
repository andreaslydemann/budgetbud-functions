const admin = require('firebase-admin');
const functions = require('firebase-functions');
const createUser = require('./create_user');
const serviceAccount = require('./config/service_account.json');
const requestCode = require('./request_code');
const verifyCode = require('./verify_code');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

exports.createUser = functions.https.onRequest(createUser);
exports.requestCode = functions.https.onRequest(requestCode);
exports.verifyCode = functions.https.onRequest(verifyCode);
