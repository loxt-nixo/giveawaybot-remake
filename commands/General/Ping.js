const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gping')
    .setDescription('check if the bot is online'),
    execute: async function (interaction, client) {
        interaction.reply({ content: '🎉  Pong!', ephemeral: true });
    }
}