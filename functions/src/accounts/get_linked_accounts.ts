import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const accountsHelper = require('../helpers/accounts_helper');
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')});
        }

        const userID = String(req.query.userID);

        try {
            const accountsArray = await accountsHelper.getLinkedAccounts(userID);
            res.status(200).send(accountsArray);
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente konti.'});
        }
    })
};
