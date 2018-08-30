const amqp = require('amqplib');

const consumer = () => {
    amqp.connect('amqp://localhost').then((conn) => {
        process.once('SIGINT', function() { conn.close(); });
        return conn.createChannel().then((channel) => {
            let queue = 'development';
            return channel.assertQueue(queue)
                .then(() => {
                    channel.prefetch(1);
                }).then((_qok) => {
                    return channel.consume(queue, (msg) => {
                        console.log(" [x] Received '%s'", msg.content.toString());
                        }, {noAck: true});
                    //TODO: Web-Push sending
                })
                .then((_consumeOk) => {
                    console.log(' [*] Waiting for messages. To exit press CTRL+C');
                });
        });
    }).catch(console.warn);
};

module.exports = {consumer};