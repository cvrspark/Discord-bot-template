import { Client, Collection, GatewayIntentBits, Message } from 'discord.js';
import { startDatabase } from './data/db.pool';
import './core/types/client';
import config from '../config.json';
import handleInteractions from './core/handlers/handleInteractions'
import { componentTimeout } from './core/services/timeout';

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        
    ],
});

client.cooldowns = new Collection();
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

client.removeAllListeners('interactionCreate');

// @ts-ignore
const originalReply = CommandInteraction.prototype.reply;

// @ts-ignore
CommandInteraction.prototype.reply = async function (options: any) {
    let originalFetchReply = false;

    if (typeof options === 'object') {
        if (options.fetchReply) {
            originalFetchReply = true;
            delete options.fetchReply;
        }
        options.withResponse = true;
    } else {
        options = { content: options, withResponse: true };
    }

    const response = await originalReply.call(this, options);

    const message = (response as any)?.resource?.message;

    if (message instanceof Message && message.components?.length > 0) {
        componentTimeout(message);
    }

    if (originalFetchReply) {
        return message;
    }
    return response;
};


async function startBot() {
    try {
        await startDatabase();
        await handleInteractions(client);
        await client.login(config.token);
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

startBot();