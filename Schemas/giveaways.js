const { Schema, model } = require('mongoose');

let giveawayBot = new Schema({
    Guild: String,
    Message: String,
    Channel: String,
    Ended: {
        type: Boolean,
        default: false
    },
    Prize: String,
    Description: String,
    endDate: Date,
    HostedBy: String,
    Entries: {
        type: Array,
        default: []
    },
    Winners: Number
});

module.exports = model('giveawayBot', giveawayBot);