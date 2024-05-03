const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
    .setName('Reroll Giveaway')
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
    execute: async function (interaction, client) {
        const giveaway = await client.schemas.giveaways.findOne({ Message: interaction.targetId, Ended: true });

        if (!giveaway) return interaction.reply({ content: '💥 This message is not a completed giveaway message!', ephemeral: true });

        const winnersArray = selectWinners(giveaway.Entries, 1);
        const winner = winnersArray.map(Winner => `<@${Winner}>`).join(', ');

        if (!winnersArray.length) return interaction.reply({ content: '💥 An error occurred when trying to reroll the giveaway.', ephemeral: true })
        
        interaction.reply({ content: `${interaction.user} rerolled the giveaway! Congratulations ${winner}! [↗](https://discord.com/channels/${giveaway.Guild}/${giveaway.Channel}/${giveaway.Message})` })
    }
}

function selectWinners(participants, count) {
    for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]];
    }
    return participants.slice(0, count);
}