const admin = require('firebase-admin');
const crypto = require('crypto');

module.exports = function (req, res) {
    if (!req.body.cprNumber || !req.body.phoneNumber)
        return res.status(400).send({error: 'Cpr-nummer og telefonnummer skal angives.'});

    const cprNumber = String(req.body.cprNumber);
    const phoneNumber = parseInt(req.body.phoneNumber);

    admin.auth().getUser(cprNumber)
        .then(userRecord => {

            // number between 1000 and 9999
            const code = Math.floor((Math.random() * 8999 + 1000)).toString();

            const salt = crypto.randomBytes(24).toString('hex');
            const hash = crypto.pbkdf2Sync(code, salt,
                10000, 128, 'sha512').toString('hex');

            const db = admin.firestore();

            db.collection("users").doc(cprNumber).set({
                phoneNumber: phoneNumber,
                codeSalt: salt,
                codeHash: hash,
                failedSignIns: 0
            })
                .then(() => {
                    res.send({success: true});
                });
        })
        .catch(err => res.status(422).send({error: 'Ukendt fejl opstod.'}));
};
