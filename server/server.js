const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const async = require('async');
const port = 3000;

const {currencies} = require("../utils/fetch-currency.js");
const {publisher} = require("../amqp/publisher.js");
const {consumer} = require("../amqp/consumer.js");
const {PushSubscription, publicKey, triggerPush} = require("../utils/push.js");

let app = express();

let server = http.Server(app);
let io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Start consumer
consumer();

let currenciesJsonOutput = {
    eur: "",
    usd: ""
};
app.get('/publish', async (req, res) => {
    await currencies(1, 'EUR', 'TRY').then((value) => {
        publisher(value); // Send the value to queue
        currenciesJsonOutput.eur = value;
    });
    await currencies(1, 'USD', 'TRY').then((value) => {
        publisher(value); // Send the value to queue
        currenciesJsonOutput.usd = value;
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(currenciesJsonOutput, null, 3));
});

io.on('connection', (socket) => {
    socket.emit('publicKey', publicKey);

    socket.on('triggerPush', (message, callback) => {
        console.log('triggerPush', message);

        triggerPush(message.subscription, message.payload).then((res) => {
            console.log(res.statusCode + ` [${res.execTime}]`);
            callback(res.statusCode + ` [${res.execTime}]`);
        });
    });

    socket.on('massPush', (payload, callback) => {
        console.log('\n=======Mass Push has started========');
        PushSubscription.find().then((docs) => {
            let i = 1;
            // Here we're limiting the maximum number of async requests at a time (https://caolan.github.io/async/docs.html#eachLimit)
            async.eachLimit(docs, 3, async (doc) => {
                await triggerPush(JSON.parse(doc.subscription), payload)
                    .then((res) => {
                        socket.emit('massPushResponse', res);
                        console.log(i++ + ") " + res.statusCode + ` [${res.execTime}]`);
                    })
                    .catch((err) => {
                        console.log('Error: ', err);
                    });
                return true;
            }, (err, results) => {
                if (err) throw err;
                // results is now an array of the response bodies
                console.log("=============Finished================")
            });
        });
        // callback('');
    });

    socket.on('subscribe', (subscription, callback) => {
        // console.log('subscribe', subscription);

        let pushSubscription = new PushSubscription({
            subscription : JSON.stringify(subscription)
        });

        pushSubscription.save().then((doc) => {
            console.log('Subscription details have been saved', doc);
            callback('Subscription details have been saved');
        }, (e) => {
            console.log('Error', e);
            callback('User couldn\'t be saved');
        });
    })
});

// WARNING: app.listen() will NOT work here because of socket.io
server.listen(port, () => {
    console.log(`Started on port ${port}`);
});