const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ghelp')
    .setDescription('shows commands'),
    execute: async function (interaction, client) {
        const embed = {
            color: parseInt("5865f2", 16),
            fields: [
                { name: 'General Commands', value: '`/gabout`\n`/gping`\n`/ginvite`' }, 
                { name: 'Giveaway Creation Commands', value: '`/gstart`\n`/gcreate`'}, 
                { name: 'Giveaway Manipulation Commands', value: '`/gend`\n`/gdelete`\n`/greroll`\n`glist`' }, 
                { name: `${client.user.username} Settings Commands`, value: '`/gsettings show`\n`/gsettings set color`\n`/gsettings set emoji`' }
            ]
        }

        interaction.reply({ embeds: [embed], content: `🎉  ${client.user.username} Commands 🎉`, ephemeral: true });
    }
}