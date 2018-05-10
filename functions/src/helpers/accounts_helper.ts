import admin = require('firebase-admin');
const translator = require('../strings/translator');

const getLinkedAccounts = async function (res, userID) {
    const db = admin.firestore();
    const accountsArray = [];
    const linkedAccounts = await db.collection("linkedAccounts")
        .where("userID", "==", userID)
        .get();

    linkedAccounts.forEach((doc) => {
        accountsArray.push(doc.id);
    });

    if (accountsArray.length === 0) {
        return res.status(422).send({error: translator.t('noLinkedAccounts')})
    }

    return accountsArray;
};

module.exports = {
    getLinkedAccounts
};
