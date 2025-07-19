require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands } = require('./src/handlers/commandHandler');
const { loadEvents } = require('./src/handlers/eventHandler');
const { logger } = require('./src/utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.Reaction
  ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Chargement des handlers
loadCommands(client);
loadEvents(client);

client.login(process.env.DISCORD_TOKEN).then(() => {
  logger('Connexion réussie au bot NXST Tickets !');
}).catch(err => {
  logger('Erreur lors de la connexion au bot : ' + err, true);
});
