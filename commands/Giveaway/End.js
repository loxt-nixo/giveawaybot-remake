const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    userPermission: ["ManageGuild"],
    data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setName('gend')
    .setDescription('end a giveaway')
    .addStringOption(opt => opt
        .setName('giveaway_id')
        .setDescription('ID of the giveaway to end now')
        .setRequired(true)
        .setAutocomplete(true)
    ),
    autocomplete: async function(interaction, client) {
        const focused = interaction.options.getFocused(true);

        const data = await client.schemas.giveaways.find({ Guild: interaction.guild.id, Ended: false });

        let options = []

        for (const giveaway of data) {
            options.push({
                name: giveaway.Prize,
                id: giveaway.Message
            });
        }

        if (focused.value) {
            options = options.filter(giveaway => {
                return giveaway.name.toLowerCase().includes( focused.value.toLowerCase() ) ||
                       giveaway.id.toLowerCase().includes( focused.value.toLowerCase() );
            });
        }

        interaction.respond( options.slice(0, 25).map(giveaway => ({ name: giveaway.name, value: giveaway.id })) );
    },
    execute: async function (interaction, client) {
        const giveaway = interaction.options.getString('giveaway_id');

        const IDRegex = /\d{19}/;

        const isID = IDRegex.test(giveaway);

        if (!isID) return interaction.reply({ content: `💥 I could not convert \`${giveaway}\` to a message ID!`, ephemeral: true });

        const giveawayData = await client.schemas.giveaways.findOne({ Message: giveaway, Ended: false });

        if (!giveawayData) return interaction.reply({ content: `💥 I could not find a giveaway with the ID \`${giveaway}\`!`, ephemeral: true });

        giveawayData.endDate = Date.now();
        await giveawayData.save();

        interaction.reply({ content: `🎉 Successfully ended giveaway ${giveaway}!`, ephemeral: true })
    }
}