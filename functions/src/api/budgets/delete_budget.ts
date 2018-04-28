import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.body.budgetID)
            return res.status(400).send({error: translator.t('noBudgetID')});

        const budgetID = String(req.body.budgetID);

        const db = admin.firestore();
        const budgetRef = db.collection('budgets').doc(budgetID);

        //Delete budget
        let budgetDoc;
        try {
            budgetDoc = await budgetRef.get()
        } catch (err) {
            res.status(401)
                .send({error: translator.t('budgetFetchFailed')});
        }

        if (!budgetDoc.exists)
            res.status(422).send({error: translator.t('budgetNotFound')});

        try {
            await budgetRef.delete();
        } catch (err) {
            res.status(422).send({error: translator.t('budgetDeletionFailed')});
        }

        const deletionPromises = [];

        //Delete categories
        const categoriesSnapshot = await db.collection("categories").where("budgetID", "==", budgetID).get();
        categoriesSnapshot.forEach(doc => {
            const categoriesDeletionPromise = doc.ref.delete();
            deletionPromises.push(categoriesDeletionPromise);
        });

        //Delete debt
        const debtsSnapshot = await db.collection("debts").where("budgetID", "==", budgetID).get();
        for (const debtIndex in debtsSnapshot.docs) {
            const debt = debtsSnapshot.docs[debtIndex];

            const categoryDebts = await db.collection("categoryDebts")
                .where("debtID", "==", debt.id)
                .get();

            console.log(categoryDebts);

            categoryDebts.forEach(categoryDebtDoc => {
                deletionPromises.push(categoryDebtDoc.ref.delete());
            });

            const debtsDeletionPromise = debt.ref.delete();
            deletionPromises.push(debtsDeletionPromise);
        }

        //Delete category alarms
        const categoryAlarmsSnapshot = await db.collection("categoryAlarms").where("budgetID", "==", budgetID).get();
        categoryAlarmsSnapshot.forEach(doc => {
            const categoryAlarmsDeletionPromise = doc.ref.delete();
            deletionPromises.push(categoryAlarmsDeletionPromise);
        });

        //Delete budget alarms
        const budgetAlarmsSnapshot = await db.collection("budgetAlarms").where("budgetID", "==", budgetID).get();
        budgetAlarmsSnapshot.forEach(doc => {
            const categoryAlarmsDeletionPromise = doc.ref.delete();
            deletionPromises.push(categoryAlarmsDeletionPromise);
        });

        await Promise.all(deletionPromises);

        res.status(200).send({success: true})
    });
};
