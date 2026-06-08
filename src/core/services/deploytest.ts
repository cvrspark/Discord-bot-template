import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import config from '../../../config.json';

const commands: any[] = [];

const cmdPath = [
    path.join(__dirname, '../../app/test'),
    path.join(__dirname, '../../app/interactions')
];

for (const interactionsPath of cmdPath) {
    if (!fs.existsSync(interactionsPath)) {
        console.warn(`Path not found: ${interactionsPath}`);
        continue;
    }

    const interactionFolders = fs.readdirSync(interactionsPath);

    for (const folder of interactionFolders) {
        const commandsPath = path.join(interactionsPath, folder);
        
        if (!fs.lstatSync(commandsPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath).default;
            
            if (command && "data" in command && "execute" in command) {
                commands.push(command.data.toJSON());
            } else {
                console.warn(`Invalid command structure at: ${filePath}`);
            }
        }
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Started deploying application-test (/) commands.');
        const route = config.private
            ? Routes.applicationGuildCommands(config.clientId, config.guildId)
            : Routes.applicationCommands(config.clientId);
        await rest.put(route, { body: commands });
        console.log('Successfully deployed application-test (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
