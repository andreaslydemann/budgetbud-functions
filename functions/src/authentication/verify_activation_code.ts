import admin = require('firebase-admin');
const crypto = require('crypto');

module.exports = async function (req, res) {
    if (!req.body.cprNumber || !req.body.activationCode)
        return res.status(400).send({error: 'Fejl i indtastning.'});

    const cprNumber = String(req.body.cprNumber);
    const activationCode = String(req.body.activationCode);

    let user;
    try {
        user = await admin.auth().getUser(cprNumber);
    } catch (err) {
        res.status(422).send({error: 'Bruger er ikke registreret.'});
    }

    if (user.disabled === true)
        return res.status(400).send({error: 'Bruger er deaktiveret.'});

    const db = admin.firestore();

    const userDoc = await db.collection("users").doc(cprNumber).get();

    if (!userDoc.exists)
        return res.status(400).send({error: 'Bruger er ikke registreret.'});

    const hash = crypto.pbkdf2Sync(activationCode, userDoc.data().codeSalt,
        10000, 128, 'sha512').toString('hex');

    if (userDoc.data().activationCodeHash !== hash)
        return res.status(400).send({error: 'Aktiveringskode er forkert.'});

    res.status(200).send({success: true});
};
