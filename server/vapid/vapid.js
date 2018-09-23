const webpush = require('web-push');
const fs = require('fs');

function generateVAPIDKeys() {
    const vapidKeys = webpush.generateVAPIDKeys();

    return {
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
    };
}

fs.writeFile('vapid.json', JSON.stringify(generateVAPIDKeys()), (err) => {
    if(err){
        console.log('Unable to write to file!');
    }
});