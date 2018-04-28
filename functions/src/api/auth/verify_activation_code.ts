import admin = require('firebase-admin');
const crypto = require('crypto');
const translator = require('../../strings/translator');

module.exports = async function (req, res) {
    if (!req.body.cprNumber || !req.body.activationCode)
        return res.status(400).send({error: translator.t('errorInEntry')});

    const cprNumber = String(req.body.cprNumber);
    const activationCode = String(req.body.activationCode);

    let user;
    try {
        user = await admin.auth().getUser(cprNumber);
    } catch (err) {
        res.status(422).send({error: translator.t('userNotRegistered')});
    }

    if (user.disabled === true)
        return res.status(400).send({error: translator.t('userDeactivated')});

    const db = admin.firestore();

    const userDoc = await db.collection("users").doc(cprNumber).get();

    if (!userDoc.exists)
        return res.status(400).send({error: translator.t('userNotRegistered')});

    const expirationTime = new Date();
    expirationTime.setTime(new Date(userDoc.data().activationCodeCreatedAt)
        .getTime() + (10 * 60 * 1000));

    if (new Date() > expirationTime)
        return res.status(400).send({error: translator.t('activationCodeExpired')});

    const hash = crypto.pbkdf2Sync(activationCode, userDoc.data().activationCodeSalt,
        10000, 128, 'sha512').toString('hex');

    if (userDoc.data().activationCodeHash !== hash)
        return res.status(400).send({error: translator.t('activationCodeInvalid')});

    res.status(200).send({success: true});
};
