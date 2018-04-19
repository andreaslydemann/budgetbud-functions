import admin = require('firebase-admin');
const crypto = require('crypto');
const twilio = require('../config/twilio');

module.exports = async function (req, res) {
    if (!req.body.cprNumber)
        return res.status(400).send({error: 'Fejl i indtastning.'});

    const cprNumber = String(req.body.cprNumber);

    let user;
    try {
        user = await admin.auth().getUser(cprNumber);
    } catch (err) {
        res.status(422).send({error: 'Bruger er ikke registreret.'})
    }

    if (user.disabled === true)
        return res.status(400).send({error: 'Bruger er deaktiveret.'});

    const db = admin.firestore();

    const userDoc = await db.collection("users").doc(cprNumber).get();

    if (!userDoc.exists)
        return res.status(400).send({error: 'Bruger er ikke registreret.'});

    // number between 1000 and 9999
    const activationCode = Math.floor((Math.random() * 8999 + 1000)).toString();

    const salt = crypto.randomBytes(24).toString('hex');
    const hash = crypto.pbkdf2Sync(activationCode, salt,
        10000, 128, 'sha512').toString('hex');

    twilio.messages.create({
        body: 'Din aktiveringskode er ' +
        activationCode + '. Koden udløber om 10 minutter.',
        to: '+45' + userDoc.data().phoneNumber,
        from: 'BudgetBud'
    }, async (err) => {
        if (err)
            return res.status(400).send(err);

        try {
            await userDoc.ref.update({
                activationCodeSalt: salt,
                activationCodeHash: hash,
                activationCodeCreatedAt: new Date()
            });
        } catch (err) {
            res.status(400).send({error: 'Fejl opstod i anmodningen.'});
        }

        res.send({success: true});
    });
};
