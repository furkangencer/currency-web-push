const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/push', {useNewUrlParser: true, useFindAndModify: false}).then().catch((err) => {
    console.log(`Can't connect to MongoDB \n ${err}`);
});

module.exports = {
    mongoose: mongoose
};