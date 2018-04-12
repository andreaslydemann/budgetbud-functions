import admin = require('firebase-admin');
import axios from 'axios';

const urls = require('../config/urls');
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

        if (!req.query.accountIDs || !req.query.from || !req.query.to)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const accountIDs = req.query.accountIDs;
        const from = String(req.query.from);
        const to = String(req.query.to);

        console.log(`${EBANKING_FUNCTIONS_URL}/getExpenses?accountIDs=${accountIDs}&from=${from}&to=${to}`);

        const {data} = await axios.get(`${EBANKING_FUNCTIONS_URL}/getExpenses?accountIDs=${accountIDs}&from=${from}&to=${to}`);

        const expenses = [];
        data.forEach((expense) => {
            const index = expenses.indexOf(expense.categoryTypeID);
            if (index !== -1) {
                expenses[index].amount += expense.amount;
            } else {
                expenses.push({
                    categoryTypeID: expense.categoryTypeID,
                    amount: expense.amount
                });
            }
        });

        res.status(200).send(expenses);
    });
};
