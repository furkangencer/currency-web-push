const amqp = require('amqplib');

const publisher = (msg) => {
    amqp.connect('amqp://localhost').then((conn) => {
        return conn.createChannel().then((channel) => {
            let queue = 'development';

            let ok = channel.assertQueue(queue);

            return ok.then((_qok) => {
                // NB: `sentToQueue` and `publish` both return a boolean
                // indicating whether it's OK to send again straight away, or
                // (when `false`) that you should wait for the event `'drain'`
                // to fire before writing again. We're just doing the one write,
                // so we'll ignore it.
                channel.sendToQueue(queue, Buffer.from(msg));
                console.log(" [x] Sent '%s'", msg);
                return channel.close();
            });
        }).finally(() => { conn.close(); });
    }).catch(console.warn);
};

module.exports = {publisher};