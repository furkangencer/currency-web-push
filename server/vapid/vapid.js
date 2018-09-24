const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

function generateVAPIDKeys() {
    const vapidKeys = webpush.generateVAPIDKeys();

    return {
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
    };
}

function writeKeysToFile() {
    fs.writeFile('vapid.json', JSON.stringify(generateVAPIDKeys()), (err) => {
        if(err){
            console.log('Unable to write to file!');
        }else {
            console.log("VAPID keys have been generated");
        }
    });
}

// function fetchPublicKey () {
//     let test = fs.readFileSync(path.join(__dirname, '/vapid.json'), 'utf8');
//     return test;
// };
module.exports = {generateVAPIDKeys, writeKeysToFile};