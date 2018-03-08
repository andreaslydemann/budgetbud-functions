const admin = require('firebase-admin');

module.exports = function (req, res) {
    if (!req.body.cprNumber) {
        return res.status(400).send({error: 'CPR-nummer ikke modtaget.'});
    }

    const cprNumber = String(req.body.cprNumber);

    admin.auth().deleteUser(cprNumber)
        .then(() => {
            const db = admin.firestore();

            db.collection("users").doc(cprNumber).delete()
                .then(() => {
                    res.status(200).send({success: true});
                });
        })
        .catch(err => res.status(422).send({error: 'Ukendt fejl opstod.'}));
};
