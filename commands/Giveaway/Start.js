const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    userPermission: ["ManageGuild"],
    data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setName('gstart')
    .setDescription('starts a giveaway')
    .addStringOption(opt => opt
        .setName('duration')
        .setDescription('duration of the giveaway')
        .setRequired(true))
    .addIntegerOption(opt => opt
        .setName('winners')
        .setDescription('number of winners')
        .setMaxValue(50)
        .setMinValue(1)
        .setRequired(true))
    .addStringOption(opt => opt
        .setName('prize')
        .setDescription('the prize being given away')
        .setRequired(true)),
    execute: async function (interaction, client) {

    }
}