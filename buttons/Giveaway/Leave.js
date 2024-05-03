module.exports = {
    customID: 'giveaway-leave',
    execute: async function(interaction, client, args) {
        const giveaway = await client.schemas.giveaways.findOne({ Guild: interaction.guild.id, Message: args[0] });

        if (giveaway.Entries.includes(interaction.user.id)) {
            //You have successfully left the giveaway!
            giveaway.Entries = giveaway.Entries.filter(item => item !== interaction.user.id);
            await giveaway.save();
            interaction.update({ embeds: [], components: [], content: '🎉 You have successfully left the giveaway!' })
        } else {
            //You are not entered in this giveaway!
            interaction.update({ embeds: [], components: [], content: '💥 You are not entered in this giveaway!' })
        }
    }
}