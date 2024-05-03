require('./utils/ProcessHandlers.js')();

const PREFIX = '!';

const { Client, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ]
});

client.config = require('./config.json');
client.logs = require('./utils/Logs.js');
client.cache = new Map();
client.cooldowns = new Map();

require('./utils/ComponentLoader.js')(client);
require('./utils/EventLoader.js')(client);
require('./utils/RegisterCommands.js')(client);

client.logs.info(`Logging in...`);
client.login(client.config.TOKEN);
client.on('ready', async function () {
    client.logs.success(`Logged in as ${client.user.tag}!`);

    if (!client.config.mongodbURL) return;

    mongoose.set("strictQuery", false);

    await mongoose.connect(client.config.mongodbURL || "", {
      //keepAlive: true,
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });

    if (mongoose.connect) {
      mongoose.set("strictQuery", true);
      client.logs.success("Database connection established!");
    }

    client.schemas = require('./utils/SchemaLoader.js')();

    setInterval(async () => {
        const Giveaways = await client.schemas.giveaways.find({ Ended: false });

        for (const Giveaway of Giveaways) {
            if (Date.now() >= Giveaway.endDate) {
                const winnersArray = selectWinners(Giveaway.Entries, Giveaway.Winners)
                const Winners = winnersArray.map(Winner => `<@${Winner}>`).join(', ');

                const Channel = client.channels.cache.get(Giveaway.Channel);
                const Message = await Channel.messages.fetch(Giveaway.Message);

                const embed = {
                    color: parseInt("2f3136", 16),
                    title: `${Giveaway.Prize}`,
                    description: `${Giveaway.Description ? `${Giveaway.Description}\n\n` : ''}Ended: <t:${Math.floor(Giveaway.endDate / 1000)}:R> (<t:${Math.floor(Giveaway.endDate / 1000)}:f>)\nHosted by: <@${Giveaway.HostedBy}>\nEntries: **${Giveaway.Entries.length}**\nWinners: ${Winners}`,
                    timestamp: Giveaway.endDate
                }

                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                    .setLabel('Giveaway Summary')
                )

                await Message.edit({ embeds: [embed], components: [row] });

                await Message.reply({ content: `${winnersArray.length > 0 ? `Congratulations ${Winners}! You won the **${Giveaway.Prize}**!` : 'No valid entrants, so a winner could not be determined!'}` });

                Giveaway.Ended = true;
                await Giveaway.save();
            }
        }
    }, 5_000);

    setInterval(async () => {
        const EndedGiveaways = await client.schemas.giveaways.find({ Ended: true });

        for (const EndedGiveaway of EndedGiveaways) {
            if (Date.now() >= (EndedGiveaway.endDate + 604800000)) {
                await client.schemas.giveaways.deleteOne({ Guild: EndedGiveaway.Guild, Message: EndedGiveaway.Message, Channel: EndedGiveaway.Channel, Ended: true });
            }
        }
    }, 5000);

    function selectWinners(participants, count) {
        for (let i = participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [participants[i], participants[j]] = [participants[j], participants[i]];
        }
        return participants.slice(0, count);
    }
});


function CheckAccess(requiredRoles, userIDs, member, user) {
    if (member && requiredRoles) {
        const hasRole = requiredRoles.some(roleID => member._roles.includes(roleID));
        if (!hasRole && !member.permissions.has('Administrator')) {
            throw 'Missing roles';
        }
    }

    if (userIDs) {
        if (!userIDs.includes(user.id)){//} && !member.permissions.has('Administrator')) {
            throw 'Missing user whitelist';
        }
    }
}

function CheckPermissions(permissionsArray, member, user) {
    let missingPermissions = [];
    if (member && permissionsArray?.length) {
        for (const permission of permissionsArray) {
            if (!member.permissions.has(PermissionFlagsBits[permission])) {
                missingPermissions.push(`${permission}`);
            }
        }
    }
    if (missingPermissions.length) {
        throw `${missingPermissions.join(', ')}`
    }
}

function CheckCooldown(user, command, cooldown) {
    if (client.cooldowns.has(user.id)) {
        const expiration = client.cooldowns.get(user.id);
        if (expiration > Date.now()) {
            const remaining = (expiration - Date.now()) / 1000;
            throw `Please wait ${remaining.toFixed(1)} more seconds before reusing the \`${command}\` command!`;
        }
    }
    if (!cooldown) return;
    client.cooldowns.set(user.id, Date.now() + cooldown * 1000);
}


async function InteractionHandler(interaction, type) {

    const args = interaction.customId?.split("_") ?? [];
    const name = args.shift();

    const component = client[type].get( name ?? interaction.commandName );
    if (!component) {
        await interaction.reply({
            content: `There was an error while executing this command!\n\`\`\`Command not found\`\`\``,
            ephemeral: true
        }).catch( () => {} );
        client.logs.error(`${type} not found: ${interaction.customId}`);
        return;
    }

    try {
        CheckAccess(component.roles, component.users, interaction.member, interaction.user);
    } catch (reason) {
        await interaction.reply({
            content: "You don't have permission to use this command!",
            ephemeral: true
        }).catch( () => {} );
        client.logs.error(`Blocked user from ${type}: ${reason}`);
        return;
    }

    try {
        CheckPermissions(component.userPermission, interaction.member, interaction.user);
    } catch (reason) {
        await interaction.reply({ 
            embeds: [{ 
                description: `You are missing the following permissions \`${reason}\``, 
                color: parseInt("f04a47", 16) 
            }], 
            ephemeral: true 
        });
        client.logs.error(`Blocked user from ${type} missing the following permissions: ${reason}`);
        return;
    }

    try {
        CheckPermissions(component.botPermission, interaction.guild.members.me, client.user);
    } catch (reason) {
        await interaction.reply({ 
            embeds: [{ 
                description: `The bot is missing the following permissions \`${reason}\``, 
                color: parseInt("f04a47", 16) 
            }], 
            ephemeral: true 
        });
        client.logs.error(`The bot was missing the following permission to execute ${type}: ${reason}`);
        return;
    }

    try {
        CheckCooldown(interaction.user, component.customID ?? interaction.commandName, component.cooldown);
    } catch (reason) {
        await interaction.reply({
            content: reason,
            ephemeral: true
        }).catch( () => {} );
        client.logs.error(`Blocked user from ${type}: On cooldown`);
        return;
    }

    try {
        if (interaction.isAutocomplete()) {
            await component.autocomplete(interaction, client, type === 'commands' ? undefined : args);
        } else {
            await component.execute(interaction, client, type === 'commands' ? undefined : args);
        }
    } catch (error) {
        client.logs.error(error.stack);
        await interaction.deferReply({ ephemeral: true }).catch( () => {} );
        await interaction.editReply({
            content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``,
            embeds: [],
            components: [],
            files: [],
            ephemeral: true
        }).catch( () => {} );
    }
}

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
    
    const subcommand = interaction.options._subcommand ?? "";
    const subcommandGroup = interaction.options._subcommandGroup ?? "";
    const commandArgs = interaction.options._hoistedOptions ?? [];
    const args = `${subcommandGroup} ${subcommand} ${commandArgs.map(arg => arg.value).join(" ")}`.trim();
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > /${interaction.commandName} ${args}`);

    await InteractionHandler(interaction, 'commands');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isButton()) return;
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > [${interaction.customId}]`);
    await InteractionHandler(interaction, 'buttons');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > <${interaction.customId}>`);
    await InteractionHandler(interaction, 'menus');
});


client.on('interactionCreate', async function(interaction) {
    if (!interaction.isModalSubmit()) return;
    client.logs.info(`${interaction.user.tag} (${interaction.user.id}) > {${interaction.customId}}`);
    await InteractionHandler(interaction, 'modals');
});

client.on('messageCreate', async function(message) {
    if (message.author.bot) return;
    if (!message.content?.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).split(/\s+/);
    const name = args.shift().toLowerCase();

    const command = client.messages.get(name);
    if (!command) {
        client.logs.error(`Command not found: ${name}`);
        return await message.reply(`There was an error while executing this command!\n\`\`\`Command not found\`\`\``).catch( () => {} );
    }

    try {
        CheckAccess(command.roles, command.users, message.member, message.author);
    } catch (reason) {
        await message.reply("You don't have permission to use this command!").catch( () => {} );
        client.logs.error(`Blocked user from messages: ${reason}`);
        return;
    }

    try {
        CheckCooldown(message.author, name, command.cooldown);
    } catch (reason) {
        await message.reply(reason).catch( () => {} );
        client.logs.error(`Blocked user from messages: On cooldown`);
        return;
    }

    try {
        await command.execute(message, client, args);
    } catch (error) {
        client.logs.error(error.stack);
        await message.reply(`There was an error while executing this command!\n\`\`\`${error}\`\`\``).catch( () => {} );
    } finally {
        client.cooldowns.set(message.author.id, Date.now() + command.cooldown * 1000);
        setTimeout(client.cooldowns.delete.bind(client.cooldowns, message.author.id), command.cooldown * 1000);
    }
});