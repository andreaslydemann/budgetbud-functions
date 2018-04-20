import axios from 'axios';

const sendNotifications = async function (messages) {
    const sendNotificationPromises = [];
    messages.forEach((message) => {
        const sendNotificationPromise = axios.post(`https://exp.host/--/api/v2/push/send`,
            {
                title: "BudgetBud",
                to: message.to,
                body: message.body,
                sound: "default"
            });
        sendNotificationPromises.push(sendNotificationPromise)
    });
    await Promise.all(sendNotificationPromises);
    return;
};

module.exports = {
    sendNotifications
};
