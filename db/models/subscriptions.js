const {mongoose} = require('../mongoose.js');

let PushSubscriptionSchema = new mongoose.Schema({
    subscription: {
        type: String,
        required: true
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