const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ginvite')
    .setDescription('add the bot to your own server'),
    execute: async function (interaction, client) {
        interaction.reply({ content: '🎉 Hello! I\'m GiveawayBot Remake! I help to make giveaways quick and easy!\nYou can add the offical bot to your server with this link:\n\n### 🔗 https://giveawaybot.party/invite', ephemeral: true })
    }
}