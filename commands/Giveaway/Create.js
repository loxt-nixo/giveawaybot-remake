const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js')

module.exports = {
    userPermission: ["ManageGuild"],
    data: new SlashCommandBuilder()
    .setName('gcreate')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDescription('starts a giveaway (interactive)'),
    execute: async function (interaction, client) {
        const modal = new ModalBuilder()
        .setCustomId('giveaway-create')
        .setTitle('Create a Giveaway')

        const firstRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
            .setCustomId('giveaway-duration')
            .setStyle(TextInputStyle.Short)
            .setLabel('Duration')
            .setMinLength(2)
            .setPlaceholder('Ex: 10 minutes')
            .setRequired(true)
        )

        const secondRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
            .setCustomId('giveaway-winners')
            .setStyle(TextInputStyle.Short)
            .setLabel('Number of winners')
            .setValue('1')
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true)
        )

        const thirdRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
            .setCustomId('giveaway-prize')
            .setStyle(TextInputStyle.Short)
            .setLabel('Prize')
            .setMinLength(1)
            .setMaxLength(128)
            .setRequired(true)
        )

        const fourthRow = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
            .setCustomId('giveaway-description')
            .setStyle(TextInputStyle.Paragraph)
            .setLabel('Description')
            .setRequired(false)
        )

        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow)

        await interaction.showModal(modal)
    }
}