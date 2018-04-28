export{};
const cors = require('cors')({origin: true});
const accountsHelper = require('../../helpers/accounts_helper');
const tokenHelper = require('../helpers/id_token_helper');
const translator = require('../strings/translator');

module.exports = async function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        const userID = String(req.query.userID);

        try {
            const accountsArray = await accountsHelper.getLinkedAccounts(userID);
            res.status(200).send(accountsArray);
        } catch (err) {
            res.status(422).send({error: translator.t('accountsFetchFailed')});
        }
    })
};
