import { Message } from 'discord.js';
import config from "../../../config.json"

export const componentTimers = new Map<string, NodeJS.Timeout>();

function disableComponentTree(component: any) {
    if (!component) return;

    if ('disabled' in component || [2, 3, 5, 6, 7, 8, 19, 21, 22, 23].includes(component.type)) {
        component.disabled = true;
    }

    if (component.components && Array.isArray(component.components)) {
        component.components.forEach((child: any) => disableComponentTree(child));
    }

    if (component.accessory) {
        disableComponentTree(component.accessory);
    }
}

export function componentTimeout(message: Message | null) {
    if (!message || !message.components || message.components.length === 0) return;

    if (config.disabletime <= 0) return;

    const messageId = message.id;

    if (componentTimers.has(messageId)) {
        clearTimeout(componentTimers.get(messageId));
        componentTimers.delete(messageId);
    }

    const timeoutId = setTimeout(async () => {
        try {
            componentTimers.delete(messageId);

            const fetchedMessage = await message.channel.messages.fetch(messageId).catch(() => null);
            if (!fetchedMessage || !fetchedMessage.components || fetchedMessage.components.length === 0) return;

            const disabledRows = fetchedMessage.components.map((row: any) => {
                const rawRow = typeof row.toJSON === 'function' ? row.toJSON() : row;
                
                disableComponentTree(rawRow);
                
                return rawRow;
            });

            const allowedMentions = {
                parse: [] as ('users' | 'roles' | 'everyone')[],
                users: Array.from(fetchedMessage.mentions.users.keys()),
                roles: Array.from(fetchedMessage.mentions.roles.keys()),
                repliedUser: fetchedMessage.mentions.repliedUser !== null
            };

            await fetchedMessage.edit({ 
                components: disabledRows as any,
                allowedMentions: allowedMentions
            });
        } catch (err) {
        }
    }, config.disabletime * 60 * 1000); // 2 minutes

    componentTimers.set(messageId, timeoutId);
}