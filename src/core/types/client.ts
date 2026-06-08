import { Collection } from 'discord.js';

declare module 'discord.js' {
    export interface Client {
        cooldowns: Collection<string, any>;
        commands: Collection<string, any>;
        buttons: Collection<string, any>;
        selectMenus: Collection<string, any>;
        modals: Collection<string, any>;
        buttonPatterns: Map<string, any>;
        selectMenuPatterns: Map<string, any>;
        modalPatterns: Map<string, any>;
    }
}