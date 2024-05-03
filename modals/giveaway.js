const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

module.exports = {
    customID: 'giveaway-create',
    execute: async function(interaction, client, args) {
        
        const duration = interaction.fields.getTextInputValue('giveaway-duration');

        if (!ms(duration)) return interaction.reply({ content: `I could not convert \`${duration}\` to a valid length of time!`, ephemeral: true });

        if (ms(duration) <= ms("10s")) return interaction.reply({ content: `The duration you provided (${duration.slice(0, -1)}) was shorter than the minimum duration (**10** seconds)!`, ephemeral: true });

        const winners = interaction.fields.getTextInputValue('giveaway-winners');

        if (isNaN(Number(winners))) return interaction.reply({ content: `I could not convert \`${winners}\` to a valid number of winners!` })

        const prize = interaction.fields.getTextInputValue('giveaway-prize');

        const description = interaction.fields.getTextInputValue('giveaway-description');

        const endDate = new Date(Date.now() + ms(duration))

        const embed = {
            color: parseInt("5865f2", 16),
            title: `${prize}`,
            description: `${description ? `${description}\n\n` : ''}Ends: <t:${Math.floor(endDate / 1000)}:R> (<t:${Math.floor(endDate / 1000)}:f>)\nHosted by: ${interaction.user}\nEntries: **0**\nWinners: **${winners}**`,
            timestamp: endDate
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('giveaway-join')
            .setStyle(ButtonStyle.Primary)
            .setEmoji({ name: "🎉" })
        )

        const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

        await client.schemas.giveaways.create({
            Guild: `${interaction.guild.id}`,
            Message: `${msg.id}`,
            Channel: `${interaction.channel.id}`,
            Ended: false,
            Prize: `${prize}`,
            Description: `${description}`,
            endDate: Date.now() + ms(duration),
            HostedBy: `${interaction.user.id}`,
            Entries: [],
            Winners: winners
        });

        interaction.reply({ content: `The giveaway was successfully created! ID: ${msg.id}`, ephemeral: true });
    }
}