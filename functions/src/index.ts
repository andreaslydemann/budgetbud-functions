const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./config/service_account');

const requestCode = require('./authentication/request_code');
const verifyCode = require('./authentication/verify_code');
const createUser = require('./authentication/create_user');
const deleteUser = require('./authentication/delete_user');
const getBudgetID = require('./budgets/get_budget_id');
const getBudget = require('./budgets/get_budget');
const createBudget = require('./budgets/create_budget');
const editBudget = require('./budgets/edit_budget');
const deleteBudget = require('./budgets/delete_budget');
const createCategories = require('./categories/create_categories');
const getCategories = require('./categories/get_categories');
const getCategoriesOfDebt = require('./categories/get_categories_of_debt');
const getCategoryTypes = require('./categories/get_category_types');
const getDebts = require('./debts/get_debts');
const createDebt = require('./debts/create_debt');
const editDebt = require('./debts/edit_debt');
const deleteDebt = require('./debts/delete_debt');
const deleteExpiredDebts = require('./debts/delete_expired_debts');
const calculateDebtCategorySubtractions =
    require('./debts/calculate_debt_category_subtractions');
const editDisposable = require('./disposable/edit_disposable');
const calculateDisposableCategoryDifferences =
    require('./disposable/calculate_disposable_category_differences');
const linkAccounts = require('./accounts/link_accounts');
const getLinkedAccounts = require('./accounts/get_linked_accounts');
const getExpensesOfMonth = require('./expenses/get_expenses_of_month');
const getAverageExpenses = require('./expenses/get_average_expenses');
const toggleCategoryAlarm = require('./alarms/toggle_category_alarm');
const getCategoryAlarms = require('./alarms/get_category_alarms');

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
exports.createCategories = functions.https.onRequest(createCategories);
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
