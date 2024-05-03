const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customID: 'giveaway-join',
    execute: async function(interaction, client, args) {
        const giveaway = await client.schemas.giveaways.findOne({ Guild: interaction.guild.id, Message: interaction.message.id });

        if (!giveaway) return interaction.reply({ content: 'The giveaway does not exist', ephemeral: true });

        if (giveaway.Entries.includes(interaction.user.id)) {
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`giveaway-leave_${interaction.message.id}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel('Leave Giveaway')
            )

            return interaction.reply({ content: 'You have already entered this giveaway!', components: [row], ephemeral: true });
        }

        giveaway.Entries.push(`${interaction.user.id}`)

        await giveaway.save();

        const embed = {
            color: parseInt("5865f2", 16),
            title: `${giveaway.Prize}`,
            description: `${giveaway.Description ? `${giveaway.Description}\n\n` : ''}Ends: <t:${Math.floor(giveaway.endDate / 1000)}:R> (<t:${Math.floor(giveaway.endDate / 1000)}:f>)\nHosted by: <@${giveaway.HostedBy}>\nEntries: **${giveaway.Entries.length}**\nWinners: **${giveaway.Winners}**`,
            timestamp: giveaway.endDate
        }

        await interaction.update({ embeds: [embed] });
    }
}