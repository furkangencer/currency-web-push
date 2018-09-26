const webpush = require('web-push');
const vapidKeys = require("./../server/vapid/vapid.json");

// Using VAPID also lets you avoid the FCM-specific steps for sending a push message. You no longer need a Firebase project, a gcm_sender_id, or an Authorization header.
webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const triggerPush = function(subscription, dataToSend) {
    // (webpush.sendNotification will automatically encrypt the payload for you, so if you use sendNotification you don't need to worry about it).
    return webpush.sendNotification(subscription, JSON.stringify(dataToSend))
        .then((res) => {
            console.log('Success: ', res.statusCode);
        })
        .catch((err) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
                console.log('Subscription is no longer valid: ', err);
                //TODO: db'den silme işlemi yapılmalı
                // return deleteSubscriptionFromDatabase(subscription._id);
            } else {
                console.log('Error: ', err);
            }
        });
};

module.exports = {
    publicKey: vapidKeys.publicKey,
    triggerPush
};
