import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import clientsettings from "../../../config.json"

const log = clientsettings.private;
export default async function handleEvents(client: Client) {
    const eventsPath = path.join(__dirname, '..', '..', 'app', 'events', );
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath).default;
        
        if (!event || !event.name || !event.execute) {
            continue;
        }
        if (log){
            console.log(`Loaded event ${event.name}`);
        }
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
            
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}