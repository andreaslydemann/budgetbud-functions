const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./config/service_account.json');
const createUser = require('./create_user');
const deleteUser = require('./delete_user');
const requestCode = require('./request_code');
const verifyCode = require('./verify_code');
const createBudget = require('./create_budgets');
const createCategories = require('./create_categories');
const editBudget = require('./edit_budgets');
const getBudget = require('./get_budgets');
const getCategories = require('./get_categories');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

exports.createUser = functions.https.onRequest(createUser);
exports.deleteUser = functions.https.onRequest(deleteUser);
exports.requestCode = functions.https.onRequest(requestCode);
exports.verifyCode = functions.https.onRequest(verifyCode);
exports.createBudget = functions.https.onRequest(createBudget);
exports.createCategories = functions.https.onRequest(createCategories);
exports.editBudget = functions.https.onRequest(editBudget);
exports.getBudget = functions.https.onRequest(getBudget);
exports.getCategories = functions.https.onRequest(getCategories);