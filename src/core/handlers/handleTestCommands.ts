import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import clientsettings from "../../../config.json"

const log = clientsettings.logs;

function loadCommandsFromDirectory(client: any, dirPath: string) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            loadCommandsFromDirectory(client, itemPath);
        } else if (item.endsWith('.ts') || item.endsWith('.js')) {
            try {
                const module = require(itemPath);
                const command = module.default || module;

                if (command && command.data && typeof command.execute === 'function') {
                    const cmdName = command.data.name;

                    if (cmdName) {
                        client.commands.set(cmdName, command);
                        if (log) {
                            console.log(`Loaded test command: ${cmdName}`);
                        }
                    }
                } 
                
            } catch (error) {
                console.error(`Error loading command at ${itemPath}:`, error);
            }
        }
    }
}

export default async function handleTestCommands(client: Client) {
    const customClient = client as any;
    
    const interactionPath = path.join(__dirname, '..', '..', 'app', 'test');
    
    if (fs.existsSync(interactionPath)) {
        const interactionFolders = fs.readdirSync(interactionPath);
        
        for (const folder of interactionFolders) {
            const folderPath = path.join(interactionPath, folder);
            const stat = fs.statSync(folderPath);
            if (stat.isDirectory()) {
                loadCommandsFromDirectory(customClient, folderPath);
            }
        }
    }
}
