const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./config/service_account.json');
const requestCode = require('./request_code');
const verifyCode = require('./verify_code');
const createUser = require('./create_user');
const deleteUser = require('./delete_user');
const getBudget = require('./get_budgets');
const createBudget = require('./create_budgets');
const editBudget = require('./edit_budgets');

const getCategories = require('./get_categories');
const createCategories = require('./create_categories');

const getDebts = require('./get_debts');
const createDebt = require('./create_debt');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

exports.requestCode = functions.https.onRequest(requestCode);
exports.verifyCode = functions.https.onRequest(verifyCode);
exports.createUser = functions.https.onRequest(createUser);
exports.deleteUser = functions.https.onRequest(deleteUser);
exports.getBudget = functions.https.onRequest(getBudget);
exports.createBudget = functions.https.onRequest(createBudget);
exports.editBudget = functions.https.onRequest(editBudget);
exports.getCategories = functions.https.onRequest(getCategories);
exports.createCategories = functions.https.onRequest(createCategories);
exports.getDebts = functions.https.onRequest(getDebts);
exports.createDebt = functions.https.onRequest(createDebt);
