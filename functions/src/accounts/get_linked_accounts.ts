const cors = require('cors')({origin: true});
const accountsHelper = require('../helpers/accounts_helper');
const tokenHelper = require('../helpers/id_token_helper');
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        try {
            await tokenHelper.verifyToken(req);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')});
        }

        const userID = String(req.query.userID);

        try {
            console.log(userID)
            const accountsArray = await accountsHelper.getLinkedAccounts(userID);
            res.status(200).send(accountsArray);
        } catch (err) {
            res.status(422).send({error: translator.t('accountsFetchFailed')});
        }
    })
};
