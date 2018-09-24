const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const port = 3000;

const {currencies} = require("../utils/fetch-currency.js");
const {publisher} = require("../amqp/publisher.js");
const {consumer} = require("../amqp/consumer.js");
const {publicKey} = require("./vapid/vapid.json");

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
});

// WARNING: app.listen() will NOT work here because of socket.io
server.listen(port, () => {
    console.log(`Started on port ${port}`);
});