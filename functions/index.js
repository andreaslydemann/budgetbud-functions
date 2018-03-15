const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./config/service_account.json');
const createUser = require('./create_user');
const deleteUser = require('./delete_user');
const requestCode = require('./request_code');
const verifyCode = require('./verify_code');
const createBudget = require('./create_budget');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

exports.createUser = functions.https.onRequest(createUser);
exports.deleteUser = functions.https.onRequest(deleteUser);
exports.requestCode = functions.https.onRequest(requestCode);
exports.verifyCode = functions.https.onRequest(verifyCode);
exports.createBudget = functions.https.onRequest(createBudget);