import { Interaction, Events, ButtonInteraction, AnySelectMenuInteraction, ModalSubmitInteraction } from 'discord.js';
import { logs } from "../../../config.json";
import { componentTimeout } from '../services/timeout';

const cooldowns = new Map<string, Map<string, number>>();

type DataInteraction = (ButtonInteraction | AnySelectMenuInteraction | ModalSubmitInteraction) & { data: string[] };

function hasCustomData(interaction: Interaction): interaction is DataInteraction {
    return interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit();
}

function handleCooldown(key: string, userId: string, cooldownTime: number): { blocked: boolean, timeString?: string } {
    if (cooldownTime === 0) return { blocked: false };

    const now = Date.now();
    
    if (!cooldowns.has(key)) {
        cooldowns.set(key, new Map());
    }

    const userCooldowns = cooldowns.get(key)!;

    if (userCooldowns.has(userId) && now - userCooldowns.get(userId)! < cooldownTime * 1000) {
        const remainingTime = cooldownTime * 1000 - (now - userCooldowns.get(userId)!);

        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0) timeString += `${minutes}m `;
        if (seconds > 0) timeString += `${seconds}s`;

        return { blocked: true, timeString: timeString.trim() };
    }

    userCooldowns.set(userId, now);
    return { blocked: false };
}

export default {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        const client = interaction.client;
        const userId = interaction.user?.id;

        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                if (logs) {
                    console.log(`Processing interaction: ${interaction.id}, type: ${interaction.type}, command: ${interaction.commandName}`);
                }

                const cooldownCheck = handleCooldown(`command_${interaction.commandName}`, userId!, command.cooldown || 0);
                
                if (cooldownCheck.blocked) {
                    await interaction.reply({
                        content: `Please wait \`${cooldownCheck.timeString}\` before using this command again.`,
                        flags: 64
                    });
                    return;
                }

                await command.execute(interaction);
            } 
            else if (hasCustomData(interaction)) {
                let handler = client.buttons.get(interaction.customId) ||
                              client.selectMenus.get(interaction.customId) ||
                              client.modals.get(interaction.customId);
                let data: string[] = [];

                if (logs){
                    console.log(`Processing interaction: ${interaction.id}, type: ${interaction.type}, ${
                        interaction.isChatInputCommand() && 'commandName' in interaction ? `command: ${(interaction as any).commandName}` : 
                        interaction.isButton() ? `button: ${interaction.customId}` : 
                        interaction.isAnySelectMenu() ? `select: ${interaction.customId}` : 
                        interaction.isModalSubmit() ? `modal: ${interaction.customId}` : 'other'
                        }`
                    );
                }

                if (!handler) {
                    const patterns = [
                        ...client.buttonPatterns || [],
                        ...client.selectMenuPatterns || [],
                        ...client.modalPatterns || []
                    ];

                    for (const [pattern, component] of patterns) {
                        const regexPattern = pattern.replace(/:\*/g, '([^:]+)');
                        const regex = new RegExp(`^${regexPattern}$`);
                        const match = interaction.customId.match(regex);

                        if (match) {
                            handler = component;
                            data = match.slice(1);
                            break;
                        }
                    }
                }

                if (!handler) return;

                const cooldownCheck = handleCooldown(interaction.customId, userId!, handler.cooldown || 0);

                if (cooldownCheck.blocked) {
                    if (interaction.isRepliable()) {
                        await interaction.reply({
                            content: `Please wait \`${cooldownCheck.timeString}\` to execute this interaction.`,
                            flags: 64
                        });
                    }
                    return;
                }

                interaction.data = data;
                
                await handler.execute(interaction);

                if ((interaction.isButton() || interaction.isAnySelectMenu()) && interaction.message) {
                    componentTimeout(interaction.message);
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            try {
                if (interaction.isRepliable()) {
                    if (interaction.deferred && !interaction.replied) {
                        await interaction.editReply({ content: 'There was an error while executing this interaction.' });
                    } else if (!interaction.replied) {
                        await interaction.reply({ content: 'There was an error while executing this interaction.', flags: 64 });
                    }
                }
            } catch (replyError) {
                console.error('Failed to send error reply:', replyError);
            }
        }
    }
};