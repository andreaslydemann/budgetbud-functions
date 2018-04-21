const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./config/service_account');

const {
    getLinkedAccounts,
    linkAccounts
} = require('./accounts');
const {
    getBudgetAlarms,
    getCategoryAlarms,
    resetAlarms,
    toggleBudgetAlarms,
    toggleCategoryAlarm
} = require('./alarms');
const {
    changeCode,
    changeForgottenCode,
    changePhoneNumber,
    createUser,
    deleteUser,
    getPhoneNumber,
    requestActivationCode,
    requestCode,
    verifyActivationCode,
    verifyCode
} = require('./authentication');
const {
    createBudget,
    deleteBudget,
    editBudget,
    getBudget,
    getBudgetID
} = require('./budgets');
const {
    createCategories,
    editCategories,
    getCategories,
    getCategoriesOfDebt,
    getCategoryTypes
} = require('./categories');
const {
    calculateDebtCategorySubtractions,
    createDebt,
    deleteDebt,
    deleteExpiredDebts,
    editDebt,
    getDebts
} = require('./debts');
const {
    calculateDisposableCategoryDifferences,
    editDisposable
} = require('./disposable');
const {
    getAverageExpenses,
    getExpensesOfMonth
} = require('./expenses');
const {
    addPushToken,
    notifyBudgetExceeded,
    notifyCategoryExceeded,
    notifyWeeklyStatus
} = require('./notifications');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

// ----------ACCOUNT RELATED FUNCTIONS----------
exports.linkAccounts = functions.https.onRequest(linkAccounts);
exports.getLinkedAccounts = functions.https.onRequest(getLinkedAccounts);

// ----------ALARM RELATED FUNCTIONS----------
exports.toggleCategoryAlarm = functions.https.onRequest(toggleCategoryAlarm);
exports.getCategoryAlarms = functions.https.onRequest(getCategoryAlarms);
exports.toggleBudgetAlarms = functions.https.onRequest(toggleBudgetAlarms);
exports.getBudgetAlarms = functions.https.onRequest(getBudgetAlarms);
exports.resetAlarms = functions.https.onRequest(resetAlarms);

// ----------AUTH RELATED FUNCTIONS----------
exports.requestCode = functions.https.onRequest(requestCode);
exports.verifyCode = functions.https.onRequest(verifyCode);
exports.createUser = functions.https.onRequest(createUser);
exports.deleteUser = functions.https.onRequest(deleteUser);
exports.getPhoneNumber = functions.https.onRequest(getPhoneNumber);
exports.changePhoneNumber = functions.https.onRequest(changePhoneNumber);
exports.changeCode = functions.https.onRequest(changeCode);
exports.changeForgottenCode = functions.https.onRequest(changeForgottenCode);
exports.requestActivationCode = functions.https.onRequest(requestActivationCode);
exports.verifyActivationCode = functions.https.onRequest(verifyActivationCode);

// ----------BUDGET RELATED FUNCTIONS----------
exports.getBudgetID = functions.https.onRequest(getBudgetID);
exports.getBudget = functions.https.onRequest(getBudget);
exports.createBudget = functions.https.onRequest(createBudget);
exports.editBudget = functions.https.onRequest(editBudget);
exports.deleteBudget = functions.https.onRequest(deleteBudget);

// ----------CATEGORY RELATED FUNCTIONS----------
exports.createCategories = functions.https.onRequest(createCategories);
exports.editCategories = functions.https.onRequest(editCategories);
exports.getCategories = functions.https.onRequest(getCategories);
exports.getCategoriesOfDebt = functions.https.onRequest(getCategoriesOfDebt);
exports.getCategoryTypes = functions.https.onRequest(getCategoryTypes);

// ----------DEBT RELATED FUNCTIONS----------
exports.getDebts = functions.https.onRequest(getDebts);
exports.createDebt = functions.https.onRequest(createDebt);
exports.editDebt = functions.https.onRequest(editDebt);
exports.deleteDebt = functions.https.onRequest(deleteDebt);
exports.deleteExpiredDebts = functions.https.onRequest(deleteExpiredDebts);
exports.calculateDebtCategorySubtractions =
    functions.https.onRequest(calculateDebtCategorySubtractions);

// ----------DISPOSABLE RELATED FUNCTIONS----------
exports.editDisposable = functions.https.onRequest(editDisposable);
exports.calculateDisposableCategoryDifferences =
    functions.https.onRequest(calculateDisposableCategoryDifferences);

// ----------EXPENSES RELATED FUNCTIONS----------
exports.getExpensesOfMonth = functions.https.onRequest(getExpensesOfMonth);
exports.getAverageExpenses = functions.https.onRequest(getAverageExpenses);

// ----------NOTIFICATION RELATED FUNCTIONS----------
exports.addPushToken = functions.https.onRequest(addPushToken);
exports.notifyBudgetExceeded = functions.https.onRequest(notifyBudgetExceeded);
exports.notifyCategoryExceeded = functions.https.onRequest(notifyCategoryExceeded);
exports.notifyWeeklyStatus = functions.https.onRequest(notifyWeeklyStatus);
