import admin = require('firebase-admin');
const crypto = require('crypto');
const twilio = require('../config/twilio');

module.exports = async function (req, res) {
    if (!req.body.cprNumber || !req.body.phoneNumber)
        return res.status(400).send({error: 'Fejl i indtastning.'});

    const cprNumber = String(req.body.cprNumber);
    const phoneNumber = parseInt(req.body.phoneNumber);

    try {
        await admin.auth().getUser(cprNumber);
    } catch (err) {
        res.status(422).send({error: 'Bruger er ikke registreret.'});
    }

    // number between 1000 and 9999
    const code = Math.floor((Math.random() * 8999 + 1000)).toString();

    const salt = crypto.randomBytes(24).toString('hex');
    const hash = crypto.pbkdf2Sync(code, salt,
        10000, 128, 'sha512').toString('hex');

    twilio.messages.create({
        body: 'Din pinkode er ' + code,
        to: '+45' + phoneNumber,
        from: 'BudgetBud'
    }, async (err) => {
        if (err) {
            return res.status(400).send(err);
        }

        const db = admin.firestore();

        await db.collection("users").doc(cprNumber).set({
            phoneNumber: phoneNumber,
            codeSalt: salt,
            codeHash: hash,
            failedSignIns: 0
        });

        res.send({success: true});
    });
};
