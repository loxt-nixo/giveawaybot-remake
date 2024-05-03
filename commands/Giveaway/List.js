const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    userPermission: ["ManageGuild"],
    data: new SlashCommandBuilder()
    .setName('glist')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDescription('show active giveaways'),
    execute: async function (interaction, client) {
        const Giveaways = await client.schemas.giveaways.find({ Guild: interaction.guild.id, Ended: false });

        if (!Giveaways.length) return interaction.reply({ content: '💥 There are no giveaways currently running!', ephemeral: true })

        let GiveawayText = "**Active Giveaways**\n\n";

        for (const Giveaway of Giveaways) {
            GiveawayText += `[\`${Giveaway.Message}\`](https://discord.com/channels/${Giveaway.Guild}/${Giveaway.Channel}/${Giveaway.Message}) | <#${Giveaway.Channel}> | **${Giveaway.Winners}** ${pluralise(Giveaway.Winners, 'winner', 'winners')} | Prize: **${Giveaway.Prize}** | Host: <@${Giveaway.HostedBy}> | Ends in ${formatSeconds(Giveaway.endDate)}\n`
        }

        interaction.reply({ content: `${GiveawayText}`, allowedMentions: {} })
    }
}

function formatSeconds(endDate) {
    let builder = [];
    let currentDate = new Date();
    let timeDifference = Math.abs(endDate - currentDate) / 1000; // Difference in seconds
  
    let years = Math.floor(timeDifference / (60 * 60 * 24 * 365));
    if (years > 0) {
      builder.push(`**${years}** ${pluralise(years, "year", "years")}`);
      timeDifference %= (60 * 60 * 24 * 365);
    }
  
    let weeks = Math.floor(timeDifference / (60 * 60 * 24 * 7));
    if (weeks > 0) {
      builder.push(`**${weeks}** ${pluralise(weeks, "week", "weeks")}`);
      timeDifference %= (60 * 60 * 24 * 7);
    }
  
    let days = Math.floor(timeDifference / (60 * 60 * 24));
    if (days > 0) {
      builder.push(`**${days}** ${pluralise(days, "day", "days")}`);
      timeDifference %= (60 * 60 * 24);
    }
  
    let hours = Math.floor(timeDifference / (60 * 60));
    if (hours > 0) {
      builder.push(`**${hours}** ${pluralise(hours, "hour", "hours")}`);
      timeDifference %= (60 * 60);
    }
  
    let minutes = Math.floor(timeDifference / 60);
    if (minutes > 0) {
      builder.push(`**${minutes}** ${pluralise(minutes, "minute", "minutes")}`);
      timeDifference %= 60;
    }
  
    if (timeDifference > 0) {
      // Round the seconds to the nearest whole number
      let roundedSeconds = Math.round(timeDifference);
      builder.push(`**${roundedSeconds}** ${pluralise(roundedSeconds, "second", "seconds")}`);
    }
  
    let str = builder.join(", ");
    if (str.endsWith(", ")) {
      str = str.substring(0, str.length - 2);
    }
    if (str === "") {
      str = "**No time**";
    }
    return str;
  }

function pluralise(x, singular, plural) {
  return x === 1 ? singular : plural;
}