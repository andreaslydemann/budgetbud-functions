import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."});
        }
        // Verify that the user provided an income
        if (!req.body.eBankingAccIDs || !req.body.userID)
            return res.status(422).send({error: 'Fejl i anmodningen.'});

        const db = admin.firestore();
        const userID = String(req.body.userID);
        const eBankingAccIDs = req.body.eBankingAccIDs;

        // Create new accounts using the userID and accountID from the eBankingData
        await db.collection('linkedAccounts')
            .where("userID", "==", userID)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            });

        eBankingAccIDs.forEach(accountDoc => {
            const id = String(accountDoc);
            db.collection('linkedAccounts').doc(id).set({
                userID
            })
                .then(() => res.status(200).send({success: true}))
                .catch(err => res.status(422)
                    .send({error: 'Kunne ikke oprette konti.'}));
        });
    })
};
