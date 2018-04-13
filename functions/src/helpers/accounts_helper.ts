import admin = require('firebase-admin');

const getLinkedAccounts = async function (userID) {
    const db = admin.firestore();
    const accountsArray = [];
    let linkedAccounts = await db.collection("linkedAccounts")
        .where("userID", "==", userID)
        .get();

    linkedAccounts.forEach((doc) => {
        accountsArray.push(doc.id);
    });

    return accountsArray;
};

module.exports = {
    getLinkedAccounts
};
