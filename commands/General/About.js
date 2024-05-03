const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gabout')
    .setDescription('show information about the bot'),
    execute: async function (interaction, client) {
        const embed = new EmbedBuilder()
        .setColor("5865f2")
        .setDescription('Hello! I\'m GiveawayBot Remake, i was developed by arnsfh (i dont own/develope GiveawayBot), if you want you can check out the bots :D [Github](...)\nMake sure to check out the real GiveawayBot at https://giveawaybot.party/ !')
        .setTitle('Hold giveaways quickly and easily!')
        .addFields(
            { name: '📊 Stats', value: `${FormatNumber(123123123)} giveaways\n${FormatNumber(client.guilds.cache.size)} ${pluralise(client.guilds.cache.size, 'guild', 'guilds')}` }
        )

        interaction.reply({ content: '🎉 All about **GiveawayBot Remake** 🎉', embeds: [embed], ephemeral: true });
    }
}

function FormatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function pluralise(x, singular, plural) {
    return x === 1 ? singular : plural;
  }