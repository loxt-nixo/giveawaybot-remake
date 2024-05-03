const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

var defaultColors = {
    "default": "#000000",
    "white": "#ffffff",
    "aqua": "#1abc9c",
    "green": "#57f287",
    "blue": "#3498db",
    "yellow": "#fee75c",
    "purple": "#9b59b6",
    "luminousvividpink": "#e91e63",
    "fuchsia": "#eb459e",
    "gold": "#f1c40f",
    "orange": "#e67e22",
    "red": "#ed4245",
    "grey": "#95a5a6",
    "navy": "#34495e",
    "darkaqua": "#11806a",
    "darkgreen": "#1f8b4c",
    "darkblue": "#206694",
    "darkpurple": "#71368a",
    "darkvividpink": "#ad1457",
    "darkgold": "#c27c0e",
    "darkorange": "#a84300",
    "darkred": "#992d22",
    "darkgrey": "#979c9f",
    "darkergrey": "#7f8c8d",
    "lightgrey": "#bcc0c0",
    "darknavy": "#2c3e50",
    "blurple": "#5865f2",
    "greyple": "#99aab5",
    "darkbutnotblack": "#2c2f33",
    "notquiteblack": "#23272a"
  };

function isValidHexColor(color) {
  color = defaultColors[color?.toLowerCase()] || color;

  const hexRegex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;

  if (!color.startsWith("#")) {
    color = `#${color}`;
  }

  return hexRegex.test(color);
}

function formatHex(color) {
  color = defaultColors[color?.toLowerCase()] || color;

  if (!color.startsWith("#")) {
    color = `#${color}`;
  }

  return color;
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gsettings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDescription('giveaway settings')
    .addSubcommand(sub => sub
        .setName('show')
        .setDescription('show current settings'))
    .addSubcommandGroup(subg => subg
        .setName('set')
        .setDescription('set settings')
        .addSubcommand(sub => sub
            .setName('color')
            .setDescription('set the giveaway embed color')
            .addStringOption(opt => opt
                .setName('hex')
                .setDescription('hex code or standard color name')
                .setRequired(true)))
        .addSubcommand(sub => sub
            .setName('emoji')
            .setDescription('set giveaway button emoji and text')
            .addStringOption(opt => opt
                .setName('emoji')
                .setDescription('emoji or button text')
                .setRequired(true)))),
    execute: async function (interaction, client) {
        const subGroup = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();

        const emoji = interaction.options.getString('emoji');
        const hex =  interaction.options.getString('hex');

        switch (subGroup) {
            case 'set':
                switch (sub) {
                    case 'color':
                        if (!isValidHexColor(hex)) return interaction.reply({ content: `💥 I could not convert \`${formatHex(hex)}\` to a valid color!`, ephemeral: true });

                        interaction.reply({ content: `🎉 The embed color for giveaways has been changed to \`${formatHex(hex)}\`.`, ephemeral: true })
                    break;
                    case 'emoji':

                    break;
                }
            default:
                switch (sub) {
                    case 'show':
                        const LanguageObject = {
                            "en-US": "English (United States)",
                            "en-GB": "English (United Kingdom)",
                            "bg": "Bulgarian",
                            "zh-CN": "Chinese (China)",
                            "zh-TW": "Chinese (Taiwan)",
                            "hr": "Croatian",
                            "cs": "Czech",
                            "da": "Danish",
                            "nl": "Dutch",
                            "fi": "Finnish",
                            "fr": "French",
                            "de": "German",
                            "el": "Greek",
                            "hi": "Hindi",
                            "hu": "Hungarian",
                            "it": "Italian",
                            "ja": "Japanese",
                            "ko": "Korean",
                            "lt": "Lithuanian",
                            "no": "Norwegian",
                            "pl": "Polish",
                            "pt-BR": "Portuguese (Brazilian)",
                            "ro": "Romanian (Romania)",
                            "ru": "Russian",
                            "es-ES": "Spanish (Spain)",
                            "sv-SE": "Swedish (Sweden)",
                            "th": "Thai",
                            "tr": "Turkish",
                            "uk": "Ukrainian",
                            "vi": "Vietnamese"
                          }

                        const embed = new EmbedBuilder()
                        .setColor("5865f2")
                        .setDescription(`Server Owner: <@${interaction.guild.ownerId}>\nGiveaway Emoji: 🎉\nLanguage: ${LanguageObject[interaction.guild.preferredLocale] || 'English'}\n\nTo control which roles can manage giveaways, head to **Server Settings** > **Integrations** > **${client.user.username}**`)

                        interaction.reply({ content: `🎉 **${client.user.username}** settings`, embeds: [embed] })
                    break;
                }
            break;
        }
    }
}