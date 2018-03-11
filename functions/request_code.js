const admin = require('firebase-admin');
const twilio = require('./config/twilio');

module.exports = function (req, res) {
    if (!req.body.cprNumber || !req.body.phoneNumber)
        return res.status(400).send({error: 'Forkert indtastning.'});

    const cprNumber = String(req.body.cprNumber);
    const phoneNumber = parseInt(req.body.phoneNumber);

    admin.auth().getUser(cprNumber)
        .then(userRecord => {

            // number between 1000 and 9999
            const code = Math.floor((Math.random() * 8999 + 1000));

            twilio.messages.create({
                body: 'Your code is ' + code,
                to: '+45' + phoneNumber,
                from: 'BudgetBud'
            }, (err) => {
                if (err) { return res.status(400).send(err); }

                const db = admin.firestore();

                db.collection("users").doc(cprNumber).set({
                    phoneNumber: phoneNumber,
                    code: code,
                    failedSignIns: 0
                })
                    .then(() => { res.send({success: true}); });
            });
        })
        .catch(err => res.status(422).send({error: 'Ukendt fejl opstod.'}));
};
