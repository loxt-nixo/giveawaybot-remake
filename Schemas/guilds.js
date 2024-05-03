const { Schema, model } = require('mongoose');

let giveawayBotGuild = new Schema({
    Guild: String,
    Emoji: {
        type: String,
        default: null
    },
    EmbedHex: {
        type: String,
        default: null
    }
});

module.exports = model('giveawayBotGuild', giveawayBotGuild);