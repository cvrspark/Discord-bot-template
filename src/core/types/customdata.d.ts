import 'discord.js';

declare module 'discord.js' {
    interface ButtonInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface BaseSelectMenuInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface ModalSubmitInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
}