import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';
import "../../core/types/client"
import clientsettings from "../../../config.json"

const log = clientsettings.logs;

function loadComponentsFromTestDirectory(client: Client, dirPath: string, componentType: 'buttons' | 'selectMenus' | 'modals') {
    if (!fs.existsSync(dirPath)) {
        return;
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            loadComponentsFromTestDirectory(client, itemPath, componentType);
        } else if (item.endsWith('.ts') || item.endsWith('.js')) {
            try {
                const component = require(itemPath).default;
                
                if (component && 'data' in component && 'execute' in component) {
                    const customId = component.data.customId;
                    
                    switch (componentType) {
                        case 'buttons':
                            client.buttons.set(customId, component);
                            if (!client.buttonPatterns) client.buttonPatterns = new Map();
                            client.buttonPatterns.set(customId, component);
                            if (log) {
                                console.log(`Loaded test button: ${customId}`);
                            }
                            break;
                        case 'selectMenus':
                            client.selectMenus.set(customId, component);
                            if (!client.selectMenuPatterns) client.selectMenuPatterns = new Map();
                            client.selectMenuPatterns.set(customId, component);
                            if (log) {
                                console.log(`Loaded test selectMenu: ${customId}`);
                            }
                            break;
                        case 'modals':
                            client.modals.set(customId, component);
                            if (!client.modalPatterns) client.modalPatterns = new Map();
                            client.modalPatterns.set(customId, component);
                            if (log) {
                                console.log(`Loaded test modal: ${customId}`);
                            }
                            break;
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
}

export default async function handleTestComponents(client: Client) {
    const interactionPath = path.join(__dirname, '..', '..', 'app', 'test');
    if (fs.existsSync(interactionPath)) {
        const interactionFolders = fs.readdirSync(interactionPath);
        
        for (const folder of interactionFolders) {
            const componentsPath = path.join(interactionPath, folder, 'components');
            
            if (fs.existsSync(componentsPath)) {
                const buttonsPath = path.join(componentsPath, 'buttons');
                if (fs.existsSync(buttonsPath)) {
                    loadComponentsFromTestDirectory(client, buttonsPath, 'buttons');
                }
                const selectMenusPath = path.join(componentsPath, 'selectMenus');
                if (fs.existsSync(selectMenusPath)) {
                    loadComponentsFromTestDirectory(client, selectMenusPath, 'selectMenus');
                }
                const modalsPath = path.join(componentsPath, 'modals');
                if (fs.existsSync(modalsPath)) {
                    loadComponentsFromTestDirectory(client, modalsPath, 'modals');
                }
            }
        }
    }
}
