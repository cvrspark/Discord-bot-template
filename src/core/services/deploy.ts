import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import config from '../../../config.json';

const commands: any[] = [];
const interactionsPath = path.join(__dirname,'../../app/interactions');
const interactionFolders = fs.readdirSync(interactionsPath);

for (const folder of interactionFolders) {
    const commandsPath = path.join(interactionsPath, folder);
    if (!fs.existsSync(commandsPath)) continue;
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath).default;
        
        (command && typeof command === "object" && "data" in command && "execute" in command)
            ? commands.push(command.data.toJSON())
            : console.warn(`Invalid command: ${filePath}`)   
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Started deploying application (/) commands.');
        const route = config.private
            ? Routes.applicationGuildCommands(config.clientId, config.guildId)
            : Routes.applicationCommands(config.clientId);
        await rest.put(route, { body: commands });
        console.log('Successfully deployed application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
