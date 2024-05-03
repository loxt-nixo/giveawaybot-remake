const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('greroll')
    .setDescription('rerolls one new winner from a giveaway')
    .addStringOption(opt => opt
        .setName('giveaway_id')
        .setDescription('ID of the giveaway to delete without ending')
        .setRequired(true)
    )
    .addIntegerOption(opt => opt
        .setName('count')
        .setDescription('ID of the giveaway to reroll')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),
    execute: async function (interaction, client) {
        const giveaway = interaction.options.getString('giveaway_id');
        const count = interaction.options.getInteger('count') || 1;

        const IDRegex = /\d{19}/;

        const isID = IDRegex.test(giveaway);

        if (!isID) return interaction.reply({ content: `💥 I could not convert \`${giveaway}\` to a message ID! Giveaways can also be rerolled directly on the original giveaway message via Right Click (Desktop) / Long Press (Mobile) > **Apps** > **Reroll Giveaway**`, ephemeral: true });

        const giveawayData = await client.schemas.giveaways.findOne({ Message: giveaway, Ended: true });

        if (!giveawayData) return interaction.reply({ content: '💥 An error occurred when trying to reroll the giveaway.', ephemeral: true });

        const winnersArray = selectWinners(giveawayData.Entries, 1);
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