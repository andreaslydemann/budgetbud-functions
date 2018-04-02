const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./config/service_account.json');

const requestCode = require('./request_code');
const verifyCode = require('./verify_code');
const createUser = require('./create_user');
const deleteUser = require('./delete_user');
const getBudgetID = require('./get_budget_id');
const getBudget = require('./get_budget');
const createBudget = require('./create_budget');
const editBudget = require('./edit_budget');
const deleteBudget = require('./delete_budget');
const getCategories = require('./get_categories');
const getCategoriesOfDebt = require('./get_categories_of_debt');
const calculateCategorySubtractions = require('./calculate_category_subtractions');
const getDebts = require('./get_debts');
const createDebt = require('./create_debt');
const editDebt = require('./edit_debt');
const deleteDebt = require('./delete_debt');
const deleteExpiredDebts = require('./delete_expired_debts');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

// ----------AUTH RELATED FUNCTIONS----------
exports.requestCode = functions.https.onRequest(requestCode);
exports.verifyCode = functions.https.onRequest(verifyCode);
exports.createUser = functions.https.onRequest(createUser);
exports.deleteUser = functions.https.onRequest(deleteUser);

// ----------BUDGET RELATED FUNCTIONS----------
exports.getBudgetID = functions.https.onRequest(getBudgetID);
exports.getBudget = functions.https.onRequest(getBudget);
exports.createBudget = functions.https.onRequest(createBudget);
exports.editBudget = functions.https.onRequest(editBudget);
exports.deleteBudget = functions.https.onRequest(deleteBudget);

// ----------CATEGORY RELATED FUNCTIONS----------
exports.getCategories = functions.https.onRequest(getCategories);
exports.getCategoriesOfDebt = functions.https.onRequest(getCategoriesOfDebt);
exports.calculateCategorySubtractions = functions.https.onRequest(calculateCategorySubtractions);

// ----------DEBT RELATED FUNCTIONS----------
exports.getDebts = functions.https.onRequest(getDebts);
exports.createDebt = functions.https.onRequest(createDebt);
exports.editDebt = functions.https.onRequest(editDebt);
exports.deleteDebt = functions.https.onRequest(deleteDebt);
exports.deleteExpiredDebts = functions.https.onRequest(deleteExpiredDebts);
