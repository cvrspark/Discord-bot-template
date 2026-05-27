# TypeScript Bot Template V2

This is a TypeScript bot template created by spark (@swagoverdosed on Discord).

## Configuration

Edit the `config.json` file:

```json
{
    "token": "your-bot-token", // Bot token
    "private": true, // Set to true for guild-specific commands, false otherwise
    "clientId": "your-client-id", // Client ID
    "guildId": "your-guild-id", // Guild ID
    "dbToken": "your-db-token", // MongoDB token
    "logs": false // Set to true for command execute logging for debugging
}
```

## Installation

Install the required dependencies using npm:

```bash
npm install # Install bot dependencies
npm install -g bun # Install Bun globally to run the bot directly from TypeScript
```

## Scripts

Here are the available scripts:

```bash
bun start             # Starts the bot
bun run deploy        # Deploys the commands
bun run deploytest    # Deploys the test commands 
bun run undeploytest  # Undeploys the test commands 
bun run comp          # Deploys and starts the bot
```

## Tips

To use wildcards (store data in custom IDs), use the following structure:

```typescript
export default {
    data: {
        customId: "confirmBan-*" // The "*" will be replaced with the actual ID if it was indicated in customId like .setCustomId(`confirmBan-${user.id}`);.
    },
    async execute(interaction: InteractionType) {
        const userId = (interaction as any).data[0];
    }
};
```

Edit src/core files only if you know what you are doing.
