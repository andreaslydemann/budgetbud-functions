import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const dateHelper = require('../helpers/date_helper');
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')})
        }

        if (!req.body.totalAmount)
            return res.status(422).send({error: translator.t('errorInEntry')});

        if (!req.body.expirationDate || Date.now() >= dateHelper.toDate(req.body.expirationDate))
            return res.status(422).send({error: translator.t('pickFutureExpirationDate')});

        if (!req.body.categories || req.body.categories.length === 0)
            return res.status(422).send({error: translator.t('noCategoriesSelected')});

        const totalAmount = parseInt(req.body.totalAmount);
        const expirationDate = dateHelper.toDate(req.body.expirationDate);
        const categories = req.body.categories;
        const debtID = req.body.debtID ? String(req.body.debtID) : '';
        const categoriesOfDebt = [];
        const db = admin.firestore();

        if (debtID) {
            try {
                const querySnapshot = await db.collection("categoryDebts")
                    .where("debtID", "==", debtID)
                    .get();

                querySnapshot.forEach((doc) => {
                    categoriesOfDebt.push({
                        categoryID: doc.data().categoryID,
                        amount: doc.data().amount
                    });
                });
            } catch (err) {
                res.status(422).send({error: translator.t('categoryFetchFailed')});
            }
        }

        let sum = 0;
        let categoryOfDebtAmount = 0;
        const calcSumPromises = [];

        categories.forEach(category => {
            const calcSumPromise = db.collection("categories").doc(category).get()
                .then((doc) => {
                    if (!doc.exists)
                        return res.status(400).send({error: translator.t('categoryNotFound')});

                    if (debtID) {
                        const categoryOfDebt = categoriesOfDebt.filter((obj) => {
                            return obj.categoryID === category;
                        });

                        categoryOfDebtAmount = categoryOfDebt[0] ? categoryOfDebt[0].amount : 0;
                    }

                    sum += parseInt(doc.data().amount + categoryOfDebtAmount);
                });

            calcSumPromises.push(calcSumPromise);
        });

        await Promise.all(calcSumPromises);
        const percentageToSubtract =
            ((totalAmount / sum) * 100) / dateHelper.numberOfMonthsUntilDate(expirationDate);

        if (percentageToSubtract > 100)
            return res.status(400).send({error: translator.t('categoryAmountsTooSmall')});

        const modifyAmountsPromises = [];
        const subtractionsArray = [];

        categories.forEach(category => {
            const categoryID = String(category);

            const modifyAmountsPromise = db.collection("categories").doc(categoryID)
                .get()
                .then((doc) => {
                    if (debtID) {
                        const categoryOfDebt = categoriesOfDebt.filter((obj) => {
                            return obj.categoryID === categoryID;
                        });

                        categoryOfDebtAmount = categoryOfDebt[0] ? categoryOfDebt[0].amount : 0;
                    }

                    const categoryAmount = parseInt(doc.data().amount + categoryOfDebtAmount);
                    let amountToSubtract =
                        Math.round((categoryAmount / 100) * percentageToSubtract);

                    if (amountToSubtract < 1)
                        amountToSubtract = 1;

                    subtractionsArray.push({categoryID, amountToSubtract});
                });

            modifyAmountsPromises.push(modifyAmountsPromise);
        });

        await Promise.all(modifyAmountsPromises);
        res.status(200).send(subtractionsArray);
    })
};
