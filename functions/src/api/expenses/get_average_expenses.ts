import axios from 'axios';
const dateHelper = require('../../helpers/date_helper');
const urls = require('../../strings/urls');
const expenseFetcher = require('../../helpers/filter_helper');
const accountsHelper = require('../../helpers/accounts_helper');
const translator = require('../../strings/translator');
const EBANKING_FUNCTIONS_URL = urls.EBANKING_FUNCTIONS_URL;
const cors = require('cors')({origin: true});
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.query.userID)
            return res.status(400).send({error: translator.t('errorInRequest')});

        let accountIDs;
        const userID = String(req.query.userID);
        const dateInterval = dateHelper.threeMonthInterval();

        try {
            accountIDs = await accountsHelper.getLinkedAccounts(res, userID);
        } catch (err) {
            res.status(422).send({error: translator.t('accountsFetchFailed')});
        }

        const {data} = await axios
            .get(`${EBANKING_FUNCTIONS_URL}/getExpensesBetweenDates?accountIDs=` +
                        `${accountIDs}&from=${dateInterval[0]}&to=${dateInterval[1]}`);

        const filteredExpenses = expenseFetcher.filterExpenses(data);

        res.status(200).send(filteredExpenses);
    });
};
