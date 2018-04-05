import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income
                if (!req.body.eBankingAccIDs || !req.body.userID)
                    return res.status(422).send({error: 'Fejl i anmodningen.'});

                const db = admin.firestore();
                const userID = String(req.body.userID);
                const eBankingAccIDs = req.body.eBankingAccIDs;

                // Create new accounts using the userID and accountID from the eBankingData
                const deleteAccountsPromises = [];
                db.collection("accounts")
                    .where("userID", "==", userID)
                    .get()
                    .then((querySnapshot) => {
                        const deleteAccountsPromise = querySnapshot.forEach((doc) => {
                            doc.ref.delete();
                        });
                        deleteAccountsPromises.push(deleteAccountsPromise)
                    });

                Promise.all(deleteAccountsPromises)
                    .then(() => {
                        eBankingAccIDs.forEach(accountDoc => {
                            const id = String(accountDoc);
                            db.collection('accounts').doc(id).set({
                                userID
                            })
                                .then(() => res.status(200).send({success: true}))
                                .catch(err => res.status(422)
                                    .send({error: 'Kunne ikke oprette konti.'}));
                        });
                        res.status(200).send({success: true});
                    })
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
