import 'discord.js';

declare module 'discord.js' {
    interface ButtonInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface BaseSelectMenuInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface StringSelectMenuInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface UserSelectMenuInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface RoleSelectMenuInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface MentionableSelectMenuInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface ChannelSelectMenuInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
    interface ModalSubmitInteraction<Cached extends CacheType = CacheType> {
        data: string[];
    }
}