import admin = require('firebase-admin');
const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        if (!req.body.cronKey)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const callersCronKey = req.body.cronKey;
        const cronKey = functions.config().cron.key;

        if (callersCronKey !== cronKey)
            res.status(422).send({error: 'Cron key matchede ikke.'});

        const db = admin.firestore();
        let budgetAlarms, categoryAlarms;

        try {
            budgetAlarms = await db.collection("budgetAlarms").get();
            categoryAlarms = await db.collection("categoryAlarms").get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente alarmer.'});
        }

        const updatePromises = [];

        budgetAlarms.docs.forEach((doc) => {
            const updatePromise = doc.ref.update({
                hasTriggered: false
            })
                .catch(() => res.status(422)
                    .send({error: 'Budgetalarmernes alarmer kunne ikke nulstilles.'}));

            updatePromises.push(updatePromise);
        });

        categoryAlarms.docs.forEach((doc) => {
            const updatePromise = doc.ref.update({
                hasTriggered: false
            })
                .catch(() => res.status(422)
                    .send({error: 'Kategorialarmernes alarmer kunne ikke nulstilles.'}));

            updatePromises.push(updatePromise);
        });

        await Promise.all(updatePromises);
        res.status(200).send({success: true});
    })
};
