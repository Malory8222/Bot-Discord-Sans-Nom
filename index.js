const { Client, GatewayIntentBits, ActivityType, MessageAttachment, GuildMember, MessageEmbed, Permissions, Guild, WebhookClient, GuildMemberManager, Role, MessageActionRow, MessageButton, VoiceChannel, MessagePayload, MessageReaction, MessageContent, GUILDS, GUILD_MESSAGES, GUILD_INVITES, GUILD_VOICE_STATES, GUILD_MESSAGE_REACTIONS, DIRECT_MESSAGES, GUILD_PRESENCES, GUILD_MEMBERS,  ChannelType, PermissionsBitField, Discord, User, UserManager, CommandInteractionOptionResolver, GuildScheduledEvent, ComponentType, GuildChannel, flatten } = require('discord.js');
const { readFileSync, writeFileSync } = require('fs');
const { SlashCommandBuilder, ContextMenuCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes, PermissionFlagsBits } = require('discord-api-types/v10');

const client = new Client({partials: ['CHANNEL', 'GUILD_MEMBER', 'GUILD_SCHEDULED_EVENT', 'MESSAGE', 'REACTION', 'USER'] , intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const { token } = require('./config.json');

client.once('ready', () => {
	client.user.setPresence({
		activities: [{ 
			name: "Protect",
			type: ActivityType.Watching,
		}],
        status: "online"
    });

    console.log('En ligne !');
});

client.login(token);

class Serveur {
    constructor(id) {
        this.serveur_id = id;
        this.anti_lien = false;
        this.anti_spam = false;
        this.anti_bot = false;
        this.welcome_channel = "";
        this.blacklist = [];
        this.permlist = [];
    }
}

class Bot {
    liste_serveurs = [];
}

class SlashCommands {
    //classe de commandes slashs
	clientId;
	commands = [];
	rest;

	constructor() {
		this.clientId = '999212383358693417';

		this.commands = [
            new SlashCommandBuilder().setName('protect').setDescription("Modifier l'état des différentes protections ou consulter les protections").addSubcommand(subcommand => subcommand.setName('info').setDescription("Consulter les protections active sur le serveur")).addSubcommand(subcommand => subcommand.setName('add-remove').setDescription("Ajouté ou retirer une protection").addStringOption(option => option.setName('protection').setDescription("Protection à modifier").addChoices({ name: "anti-lien", value: "anti-lien" }, { name: "anti-spam", value: "anti-spam" }, { name: "anti-bot", value: "anti-bot" }).setRequired(true))),
            new SlashCommandBuilder().setName('salon-bienvenue-aurevoir').setDescription("Modifier le salon de bienvenue & aurevoir").addChannelOption(option => option.setName('salon').setDescription("Le salon dans lequel vous souhaitez que les messages soient envoyés").setRequired(true)),
            new SlashCommandBuilder().setName('blacklist').setDescription("Ajouté/retiré ou consulté les utilisateurs de la blacklist").addSubcommand(subcommmand => subcommmand.setName('info').setDescription("Pour voir la blacklist")).addSubcommand(subcommmand => subcommmand.setName('add-remove').setDescription("Ajouté ou retiré un utilisateur dans la blacklist").addUserOption(option => option.setName('user').setDescription("Utilisateur que vous souhaitez ajouter ou retirer").setRequired(true))),
            new SlashCommandBuilder().setName('permlist').setDescription("Ajouté/retiré un utilisateur qui peux executé les commandes de protections").addSubcommand(subcommand => subcommand.setName('info').setDescription("Pour voir la liste des utilisateurs autorisés à executer les commandes")).addSubcommand(subcommand => subcommand.setName('add-remove').setDescription("Ajouté ou retiré un utilisateur dans la permlit").addUserOption(option => option.setName('user').setDescription("tilisateur que vous souhaitez ajouter ou retirer").setRequired(true))),
            new SlashCommandBuilder().setName('ban').setDescription("Bannir un utilisateur").addUserOption(option => option.setName('user').setDescription("Utilisateur à bannir").setRequired(true)),
            new SlashCommandBuilder().setName('unban').setDescription("Débannir un utilisateur").addUserOption(option => option.setName('user').setDescription("Utilisateur à débannir").setRequired(true)),
            new SlashCommandBuilder().setName('kick').setDescription("Kick un utilisateur").addUserOption(option => option.setName('user').setDescription("Utilisateur à kick").setRequired(true)),
        ].map(command => command.toJSON());

		this.rest = new REST({ version: '10' }).setToken(token);
	}

	build() {
		this.rest.put(Routes.applicationCommands(this.clientId), { body: this.commands })
			.then((data) => console.log(`${data.length} commandes enregistrées.`))
			.catch(console.error);
	}
}

function messageHasLink(message) {
    let index = message.indexOf(".png");
  
    if (index === -1) {
      index = message.indexOf(".jpg");
    }
  
    if (index === -1) {
      index = message.indexOf(".jpeg");
    }
  
    if (index === -1) {
      index = message.indexOf(".com");
    }
  
    if (index === -1) {
      index = message.indexOf(".be");
    }
  
    if (index === -1) {
      index = message.indexOf(".fr");
    }
  
    if (index === -1) {
      index = message.indexOf(".tv");
    }
  
    if (index === -1) {
      index = message.indexOf(".html");
    }
  
    if (index === -1) {
      index = message.indexOf(".php");
    }
  
    if (index === -1) {
      index = message.indexOf(".jpg");
    }
  
    if (index === -1) {
      index = message.indexOf(".gif");
    }
  
    if (index === -1) {
      index = message.indexOf(".png");
    }
  
    if (index === -1) {
      index = message.indexOf(".web");
    }
  
    if (index === -1) {
      index = message.indexOf(".svg");
    }
  
    if (index === -1) {
      return false
    }
    else {
      return true
    }
}

function containsInListIndex(list, element) {
    let lg_liste = list.length;
    let retour = -1;

    if (lg_liste > 1) {
        for (let i = 0; i < lg_liste; i ++) {
            if (String(list[i]).includes(element)) {
                retour = i;
            }
        }
    }
    else if (lg_liste === 1) {
        retour = 0;
    }

    return retour;
}

function contains(element, liste) {
    //fonction qui regarde si un "element" est dans la "liste"
    let i = 0;
    trouve = false;

    while ((!trouve) && (i < liste.length)) {
        if (liste[i] == element) {
            trouve = true;
        }
        else {
            i++;
        }
    }
  
    return trouve;
}

const slash_commands = new SlashCommands();

slash_commands.build();

const fichier = './data.json';

const file_content = readFileSync(fichier, 'utf8');

let morsu;

if (file_content == "{}" || file_content == ""){
	morsu = new Bot();
}
else {
	morsu = JSON.parse(file_content);
}

let valid_emoji = "<:valid:1111555791477026817>";
let unvalid_emoji = "<:unvalid:1111555788893339688>";

client.on('interactionCreate', async interaction => {
    const commandName = interaction.commandName;

    let current_serveur = morsu.liste_serveurs.filter(s => s.serveur_id === interaction.channel.guildId)[0];

    if (commandName === "protect") {
        if (interaction.options.getSubcommand() === "info") {
            let anti_lien;
            let anti_spam;
            let anti_bot;

            if (current_serveur === undefined || current_serveur === null || current_serveur === "") {
                let new_serveur = new Serveur(interaction.channel.guildId);

                morsu.liste_serveurs.push(new_serveur);

                anti_lien = new_serveur.anti_lien;
                anti_spam = new_serveur.anti_spam;
                anti_bot = new_serveur.anti_bot;

                writeFileSync(fichier, JSON.stringify(morsu, null, 2));
            }
            else {
                anti_lien = current_serveur.anti_lien
                anti_spam = current_serveur.anti_spam;
                anti_bot = current_serveur.anti_bot;
            }

            let lesFields = [];

            if (anti_lien) {
                lesFields.push({
                    name: "Anti lien",
                    value: valid_emoji,
                });
            }
            else {
                lesFields.push({
                    name: "Anti lien",
                    value: unvalid_emoji,
                });
            }

            if (anti_spam) {
                lesFields.push({
                    name: "Anti spam",
                    value: valid_emoji,
                });
            }
            else {
                lesFields.push({
                    name: "Anti spam",
                    value: unvalid_emoji,
                });
            }

            if (anti_bot) {
                lesFields.push({
                    name: "Anti bot",
                    value: valid_emoji,
                });
            }
            else {
                lesFields.push({
                    name: "Anti bot",
                    value: unvalid_emoji,
                });
            }
        
            let protection_embed = {
                color: 0x6D3FC3,
                title: `Informations de protection du serveur ${interaction.guild.name} :`,
                fields: lesFields
            }

            interaction.reply({ embeds: [ protection_embed ] });
        }
        else if (interaction.options.getSubcommand() === "add-remove") {
            let protection = interaction.options.getString("protection");
            let response = "";

            if (current_serveur === undefined || current_serveur === null || current_serveur === "") {
                if (interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                    let new_serveur = new Serveur(interaction.channel.guildId);

                    morsu.liste_serveurs.push(new_serveur);

                    if (protection === "anti-lien") {
                        anti_lien = new_serveur.anti_lien = true;
                        response = `L'anti lien à bien été activé sur le serveur`;
                    }
                    else if (protection === "anti-spam") {
                        anti_spam = new_serveur.anti_spam = true;
                        response = `L'anti spam à bien été activé sur le serveur`;
                    }
                    else {
                        anti_bot = new_serveur.anti_bot = true;
                        response = `L'anti bot à bien été activé sur le serveur`;
                    }

                    writeFileSync(fichier, JSON.stringify(morsu, null, 2));
                }
                else {
                    response = "Vous n'avez pas la permission de faire cela";
                }
            }
            else {
                if (contains(interaction.member.id, current_serveur.permlist) || interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                    if (protection === "anti-lien") {
                        if (current_serveur.anti_lien) {
                            current_serveur.anti_lien = false;
                            response = `L'anti lien à bien été désactivé sur le serveur`;
                        }
                        else {
                            current_serveur.anti_lien = true;
                            response = `L'anti lien à bien été activé sur le serveur`;
                        }
                    }
                    else if (protection === "anti-spam") {
                        if (current_serveur.anti_spam) {
                            current_serveur.anti_spam = false;
                            response = `L'anti spam à bien été désactivé sur le serveur`;
                        }
                        else {
                            current_serveur.anti_spam = true;
                            response = `L'anti spam à bien été activé sur le serveur`;
                        }
                    }
                    else {
                        if (current_serveur.anti_bot) {
                            current_serveur.anti_bot = false;
                            response = `L'anti bot à bien été désactivé sur le serveur`;
                        }
                        else {
                            current_serveur.anti_bot = true;
                            response = `L'anti bot à bien été activé sur le serveur`;
                        }
                    }
    
                    writeFileSync(fichier, JSON.stringify(morsu, null, 2));
                }
                else {
                    response = "Vous n'avez pas la permission de faire cela";
                }
            }

            interaction.reply(response);
        }
    }
    else if (commandName === "salon-bienvenue-aurevoir") {
        let channel = interaction.options.getChannel("salon");

        if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
            if (interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                let new_serveur = new Serveur(interaction.channel.guildId);

                new_serveur.welcome_channel = channel.id;

                morsu.liste_serveurs.push(new_serveur);

                writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                interaction.reply(`Le salon de bienvenue/aurevoir est maintenant dans <#${channel.id}>`);
            }
            else {
                interaction.reply("Vous n'avez pas la permission de faire cela");
            }
        }
        else {
            if (contains(interaction.member.id, current_serveur.permlist) || interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                let new_serveur = new Serveur(interaction.channel.guildId);

                new_serveur.welcome_channel = channel.id;

                morsu.liste_serveurs.push(new_serveur);

                writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                interaction.reply(`Le salon de bienvenue/aurevoir est maintenant dans <#${channel.id}>`);
            }
            else {
                interaction.reply("Vous n'avez pas la permission de faire cela");
            }
        }
    }
    else if (commandName === "blacklist") {
        if (interaction.options.getSubcommand() === "info") {
            let blackListEmbed;

            if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
                let new_serveur = new Serveur(interaction.channel.guildId);

                morsu.liste_serveurs.push(new_serveur);

                writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                blackListEmbed = {
                    color: 0x6D3FC3,
                    title: `Blacklist :`,
                    description: "La liste est vide pour le moment"
                }
            }
            else {
                let blacklist = current_serveur.blacklist;

                let description = "";

                if (blacklist.length > 1) {
                    for (let i = 0; i < blacklist.length; i ++) {
                        description += `<@${blacklist[i]}> \n`;
                    }
                }
                else if (blacklist.length === 1) {
                    description += `<@${blacklist[0]}>`;
                }
                else {
                    description = "La liste est vide pour le moment";
                }

                blackListEmbed = {
                    color: 0x6D3FC3,
                    title: `Blacklist :`,
                    description: description
                }
            }

            interaction.reply({ embeds: [blackListEmbed] });
        }
        else if (interaction.options.getSubcommand() === "add-remove") {
            let user = interaction.options.getUser("user");

            if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
                if (interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                    let new_serveur = new Serveur(interaction.channel.guildId);

                    new_serveur.blacklist.push(user.id);

                    morsu.liste_serveurs.push(new_serveur);

                    writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                    interaction.reply(`L'utilisateur <@${user.id}> a bien été ajouté à la blacklist`);
                }
                else {
                    interaction.reply("Vous n'avez pas la permission de faire cela");
                }
            }
            else {
                if (contains(interaction.member.id, current_serveur.permlist) || interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                    let blacklist = current_serveur.blacklist;

                    if (contains(user.id, blacklist)) {
                        let index_of_user = blacklist.indexOf(user.id);

                        blacklist.splice(index_of_user, 1);

                        writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                        let deban = await interaction.guild.bans.fetch();

                        let user_to_deban = "";

                        for (let guildban of deban) {
                            if (guildban[0] === user.id) {
                                user_to_deban = guildban[0];
                            }
                        }

                        interaction.guild.members.unban(user_to_deban);

                        interaction.reply(`L'utilisateur <@${user.id}> a bien été retiré de la blacklist`);
                    }
                    else {
                        blacklist.push(user.id);

                        writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                        let user_to_ban = interaction.guild.members.cache.find(member => member.id === user.id);

                        user_to_ban.ban();

                        interaction.reply(`L'utilisateur <@${user.id}> a bien été ajouté à la blacklist`);
                    }
                }
                else {
                    interaction.reply("Vous n'avez pas la permission de faire cela");
                }
            }
        }
    }
    else if (commandName === "permlist") {
        if (interaction.options.getSubcommand() === "info") {
            let permListEmbed;

            if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
                let new_serveur = new Serveur(interaction.channel.guildId);

                morsu.liste_serveurs.push(new_serveur);

                writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                permListEmbed = {
                    color: 0x6D3FC3,
                    title: `Permlist :`,
                    description: "La liste est vide pour le moment"
                }
            }
            else {
                if (current_serveur.permlist.length === 0) {
                    permListEmbed = {
                        color: 0x6D3FC3,
                        title: `Permlist :`,
                        description: "La liste est vide pour le moment"
                    }
                }
                else {
                    let description = "";

                    for (let i = 0; i < current_serveur.permlist.length; i ++) {
                        description += current_serveur.permlist[i] + "\n";
                    }

                    permListEmbed = {
                        color: 0x6D3FC3,
                        title: `Permlist :`,
                        description: description
                    }
                }
            }

            interaction.reply({ embeds: [permListEmbed] });
        }
        else if (interaction.options.getSubcommand() === "add-remove") {
            let user = interaction.options.getUser("user");
            let response = "";

            if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
                if (interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                    let new_serveur = new Serveur(interaction.channel.guildId);

                    new_serveur.permlist.push(user.id);

                    morsu.liste_serveurs.push(new_serveur);

                    writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                    response = `L'utilisateur <@${user.id}> a bien été ajouté à la permlist`;
                }
                else {
                    response = "Vous n'avez pas la permission de faire cela";
                }
            }
            else {
                if (contains(interaction.member.id, current_serveur.permlist) || interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
                    if (contains(user.id, current_serveur.permlist)) {
                        if (interaction.member.id === user.id) {
                            response = "Vous ne pouvez pas vous retirer vous même de la liste";
                        }
                        else {
                            let user_index = current_serveur.permlist.indexOf(user.id);

                            current_serveur.permlist.splice(user_index, 1);

                            writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                            response = `L'utilisateur <@${user.id}> a bien été retiré de la permlist`;
                        }
                    }
                    else {
                        current_serveur.permlist.push(user.id);

                        writeFileSync(fichier, JSON.stringify(morsu, null, 2));

                        response = `L'utilisateur <@${user.id}> a bien été ajouté à la permlist`;
                    }
                }
                else {
                    response = "Vous n'avez pas la permission de faire cela";
                }
            }

            interaction.reply(response);
        }
    }
    else if (commandName === "ban") {
        let user = interaction.options.getUser("user");

        if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
            if (interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
                if (user.id === interaction.member.id) {
                    interaction.reply("Vous ne pouvez pas vous bannir vous même");
                }
                else {
                    interaction.guild.members.ban(user);

                    interaction.reply(`L'utilisateur <@${user.id}> a bien été banni du serveur`);
                }
            }
        }
        else {
            if (contains(interaction.member.id, current_serveur.permlist) || interaction.memberPermissions.has(PermissionFlagsBits.BanMembers) ) {
                interaction.guild.members.ban(user);

                interaction.reply(`L'utilisateur <@${user.id}> a bien été banni du serveur`);
            }
            else {
                interaction.reply("Vous n'avez pas les permissions de bannir un utilisateur");
            }
        }
    }
    else if (commandName === "unban") {
        let user = interaction.options.getUser("user");

        if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
            if (interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
                if (user.id === interaction.member.id) {
                    interaction.reply("Ça n'a pas d'interêt, vous n'êtes pas banni du serveur");
                }
                else {
                    interaction.guild.members.unban(user);

                    interaction.reply(`L'utilisateur <@${user.id}> a bien été débanni du serveur`);
                }
            }
        }
        else {
            if (contains(interaction.member.id, current_serveur.permlist) || interaction.memberPermissions.has(PermissionFlagsBits.BanMembers) ) {
                interaction.guild.members.unban(user);

                interaction.reply(`L'utilisateur <@${user.id}> a bien été débanni du serveur`);
            }
            else {
                interaction.reply("Vous n'avez pas les permissions de débannir un utilisateur");
            }
        }
    }
    else if (commandName === "kick") {
        let user = interaction.options.getUser("user");

        if (current_serveur == undefined || current_serveur == null || current_serveur == "") {
            if (interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
                if (user.id === interaction.member.id) {
                    interaction.reply("Vous ne pouvez pas vous kick vous même");
                }
                else {
                    interaction.guild.members.kick(user);

                    interaction.reply(`L'utilisateur <@${user.id}> a bien été kick du serveur`);
                }
            }
        }
        else {
            if (contains(interaction.member.id, current_serveur.permlist) || interaction.memberPermissions.has(PermissionFlagsBits.KickMembers) ) {
                interaction.guild.members.kick(user);

                interaction.reply(`L'utilisateur <@${user.id}> a bien été kick du serveur`);
            }
            else {
                interaction.reply("Vous n'avez pas les permissions de kick un utilisateur");
            }
        }
    }
});

let limit_messages = 3;
let limit_btw_send = 3700;
let messages = [];

client.on('messageCreate', async message => {
    let current_serveur = morsu.liste_serveurs.filter(s => s.serveur_id === message.channel.guildId)[0];

    if (current_serveur != undefined && current_serveur != null && current_serveur != "") {
        if (current_serveur.anti_lien) {
            let message_content = message.content;

            if (message_content.includes("https://") || message_content.includes("http://") || message_content.includes("www.")) {
                let start_of_link = message_content.indexOf("https://");

                if (start_of_link === -1) {
                    start_of_link = message_content.indexOf("http://");
                }

                if (start_of_link === -1) {
                    start_of_link = message_content.indexOf("www.");
                }

                let hasLink = messageHasLink(message_content, start_of_link);

                if (hasLink) {
                    message.delete().then(e => {
                        message.channel.send("Il est interdit d'envoyer des liens dans ce serveur");
                    });
                }
            }
        }

        if (current_serveur.anti_spam) {
            if (messages.length === limit_messages) {
                await message.channel.bulkDelete(limit_messages + 3);
                message.channel.send("Il est interdit de spam dans ce serveur");
            }

            if (messages.length >= 1) {
                let previous_message = messages[messages.length - 1];
                let previous_message_time = previous_message[1];

                let current_message = message;
                let current_message_time = current_message.createdTimestamp;
                let messages_author = [];

                for (let i = 0; i < messages.length; i ++) {
                    messages_author.push(messages[i][0]);
                }

                let contains = containsInListIndex(messages_author, message.author.id);

                if (contains != -1) {
                    if ( ((current_message_time - previous_message_time) < limit_btw_send) && ((current_message_time - messages[contains][1]) < limit_btw_send) ) {
                        messages.push([message.author.id, message.createdTimestamp]);
                    }
                    else {
                        messages = [];
                    }
                }
                else {
                    messages = [];
                }
            }
            else {
                messages.push([message.author.id, message.createdTimestamp]);
            }
        }

        if (current_serveur.anti_bot) {
            if (message.embeds.length >= 1 && !message.author.bot) {
                await message.delete();
                message.channel.send("Il est interdit d'avoir un custom bot dans ce serveur");
            }
            else if (message.components.length >= 1 && !message.author.bot) {
                await message.delete();
                message.channel.send("Il est interdit d'avoir un custom bot dans ce serveur");
            }
            else if (message.content === "" && message.attachments.length === 0 && !message.author.bot) {
                await message.delete();
                message.channel.send("Il est interdit d'avoir un custom bot dans ce serveur");
            }
        }
    }
});

client.on('guildMemberAdd', member => {
    let current_serveur = morsu.liste_serveurs.filter(s => s.serveur_id === member.guild.id)[0];

    if (current_serveur != undefined && current_serveur != null && current_serveur != "") {
        if (current_serveur.welcome_channel != "") {
            let welcome_channel = member.guild.channels.cache.find(channel => channel.id === current_serveur.welcome_channel);
            welcome_channel.send(`Bienvenue à <@${member.id}> dans le serveur ${member.guild.name} !`);
        }
        if (current_serveur.blacklist.length > 0) {
            let user_in_blacklist = current_serveur.blacklist.filter(id => id === member.id)[0];

            if (user_in_blacklist != undefined && user_in_blacklist != null && user_in_blacklist != "") {
                member.ban();
            }
        }
    }
});

client.on('guildMemberRemove', member => {
    let current_serveur = morsu.liste_serveurs.filter(s => s.serveur_id === member.guild.id)[0];

    if (current_serveur != undefined && current_serveur != null && current_serveur != "") {
        if (current_serveur.welcome_channel != "") {
            let welcome_channel = member.guild.channels.cache.find(channel => channel.id === current_serveur.welcome_channel);
            welcome_channel.send(`Nous souhaitons au revoir à ${member.user.tag} qui a quitté le serveur`);
        }
    }
});