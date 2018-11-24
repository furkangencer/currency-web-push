const {mongoose} = require('../mongoose.js');

let PushSubscriptionSchema = new mongoose.Schema({
    endpoint: {
        type: String,
        index: true
    },
    keys: {
        auth: { type: String },
        p256dh: { type: String }
    },
    statusCode: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

let PushSubscription = mongoose.model('PushSubscription', PushSubscriptionSchema);

module.exports = {
    PushSubscription
};