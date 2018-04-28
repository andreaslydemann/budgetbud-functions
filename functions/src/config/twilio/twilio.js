const twilio = require('twilio');
const twilioAccount = require('./twilio_account');

module.exports = new twilio.Twilio(
    twilioAccount.accountSid,
    twilioAccount.authToken
);
