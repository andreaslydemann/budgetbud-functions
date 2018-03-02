const admin = require('firebase-admin');

module.exports = function (req, res) {
    if (!req.body.cprNumber || !req.body.phoneNumber) {
        return res.status(422).send({error: 'Cpr-nummer og telefonnummer skal angives.'});
    }

    const cprNumber = String(req.body.cprNumber);
    const phoneNumber = parseInt(req.body.phoneNumber);

    admin.auth().getUser(cprNumber)
        .then(userRecord => {

            // number between 1000 and 9999
            const code = Math.floor((Math.random() * 8999 + 1000));
            const db = admin.firestore();

            db.collection("users").doc(cprNumber).set({
                phoneNumber: phoneNumber,
                code: code
            })
                .then(function () {
                    res.send({success: true});
                });
        })
        .catch((err) => {
            res.status(422).send({error: err});
        });
};
