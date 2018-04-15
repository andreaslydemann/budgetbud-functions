import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."})
        }

        if (!req.body.disposableDifference)
            return res.status(422).send({error: 'Fejl i indtastning.'});

        if (!req.body.categories || req.body.categories.length === 0)
            return res.status(422).send({error: 'Ingen kategorier valgt.'});

        const disposableDifference = parseInt(req.body.disposableDifference);
        const categories = req.body.categories;
        const db = admin.firestore();

        let sum = 0;
        const calcSumPromises = [];

        categories.forEach(category => {
            const calcSumPromise = db.collection("categories").doc(category).get()
                .then((doc) => {
                    if (!doc.exists)
                        return res.status(400).send({error: 'Kategori kunne ikke findes.'});

                    sum += parseInt(doc.data().amount);
                });

            calcSumPromises.push(calcSumPromise);
        });

        await Promise.all(calcSumPromises);

        const percentageDifference =
            ((disposableDifference / sum) * 100);

        if (percentageDifference > 100)
            return res.status(400).send({error: 'Kategoriernes beløb er ikke store nok.'});

        const modifyAmountsPromises = [];
        const differencesArray = [];

        categories.forEach(category => {
            const categoryID = String(category);

            const modifyAmountsPromise = db.collection("categories").doc(categoryID)
                .get()
                .then((doc) => {
                    const categoryAmount = parseInt(doc.data().amount);
                    const amountDifference =
                        Math.round((categoryAmount / 100) * percentageDifference);

                    differencesArray.push({categoryID, amountDifference});
                });

            modifyAmountsPromises.push(modifyAmountsPromise);
        });

        await Promise.all(modifyAmountsPromises);
        res.status(200).send(differencesArray);
    })
};
