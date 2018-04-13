import admin = require('firebase-admin');
import axios from 'axios';

const dateHelper = require('../helpers/date_helper');
const urls = require('../config/urls');
const expenseFetcher = require('../helpers/filter_expenses');
const EBANKING_FUNCTIONS_URL = urls.EBANKING_FUNCTIONS_URL;
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."});
        }

        if (!req.query.accountIDs)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const accountIDs = req.query.accountIDs;
        const dateInterval = dateHelper.threeMonthInterval();

        const {data} =
            await axios.get(`${EBANKING_FUNCTIONS_URL}/getExpenses?accountIDs=${accountIDs}&from=${dateInterval[0]}&to=${dateInterval[1]}`);

        const filteredExpenses = expenseFetcher.filterExpenses(data);

        res.status(200).send(filteredExpenses);
    });
};
