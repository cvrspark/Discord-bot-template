# TypeScript Bot Template V3

> A robust, modular TypeScript template for Discord bots, created by **spark** (@swagoverdosed on Discord).

This template provides a highly organized framework for managing events, commands, components (buttons, modals, menus), and database connections, ensuring your project remains scalable and easy to maintain.

---

## ⚙️ Configuration

Before running the bot, edit the `config.json` file in the root directory to match your environment:

```json
{
    "token": "YOUR_BOT_TOKEN",         // Your Discord Bot Token
    "guildId": "YOUR_GUILD_ID",        // Guild ID for local testing/deployment
    "clientId": "YOUR_CLIENT_ID",      // Your Bot's Application/Client ID
    "private": true,                   // Set to true for guild-specific commands, false for global
    "logs": true,                      // Enable/Disable command execution logs in the console
    "db": {
        "host": "localhost",           // Database host address (or MongoDB URI)
        "user": "db_user",             // Database username
        "password": "db_password",     // Database password
        "database": "db_name"          // Database name
    }
}

```

---

## Installation & Database Setup

This template uses **MySQL** by default, but it is fully configured to support **MongoDB**. Follow the instructions based on your preferred database.

### Option A: Standard Setup (MySQL)

If you are sticking with the default MySQL setup, simply install the dependencies:

```bash
npm install          # Install bot dependencies
npm install -g bun   # Install Bun globally (recommended for running the bot)

```

### Option B: MongoDB Migration Setup

If you prefer to use MongoDB, you must swap the framework files **before** installing your packages:

1. **Swap Files:** Copy and replace the necessary files from the `mongodbsrc` folder into your working directories.
2. **Install Dependencies:** Run `bun install` or `npm install`.
```bash
# or
npm install mongoose

```



---

## Scripts

Use the following commands to manage, deploy, and run your bot. *(Note: `bun` is highly recommended for speed and native TypeScript execution).*

| Command | Description |
| --- | --- |
| `bun start` | Starts the bot without deploying commands. |
| `bun run deploy` | Deploys commands (Globally or to the Guild based on `config.private`). |
| `bun run deploytest` | Deploys test commands to your designated guild. |
| `bun run undeploytest` | Removes test commands from your designated guild. |
| `bun run comp` | **Recommended:** Ddeploys commands and starts the bot simultaneously. |

---

## Database Management

### 1. Registering Schemas

Whenever you create a new database schema in `src/data/schemas`, you **must** register it. Add the filename to `src/data/order.json` so the handler loads and initializes it in the correct order on startup.

### 2. Using Function Classes

Keep your database logic clean by utilizing **Function Classes** for all queries and calls.

1. Create your class inside the `src/data/functions/` directory.
2. Import and export it through the centralized `src/data/database.ts` file.

**Example `src/data/database.ts`:**

```typescript
import UserDB from "./functions/UserDB";
import EconomyDB from "./functions/EconomyDB";

// Export all classes centrally for easy importing across your app
export { UserDB, EconomyDB };

```

---

## Developer Tips

### Dynamic Custom IDs (Wildcards)

You can store dynamic data (like User IDs) directly inside Discord Component Custom IDs using a wildcard `*` structure.

**Setup:**

```typescript
export default {
    data: {
        // The "*" will act as a wildcard catcher
        // Example trigger: .setCustomId(`confirmBan-${user.id}`)
        customId: "confirmBan-*" 
    },
    async execute(interaction: InteractionType) {
        // Retrieves the dynamic portion that replaced the "*"
        const targetUserId = (interaction as any).data[0]; 
        
        console.log(`Action triggered for User: ${targetUserId}`);
    }
};

```

> ⚠️ **Warning:** Edit files within the `src/core/` directory **only** if you fully understand the framework's internal logic. These files handle the automatic loading and routing of your app's commands and events.

---

## Project Architecture

```text
./src
├── app/                              # Your Bot's Features & Logic
│   ├── events/                       # App-specific event listeners
│   │   └── Event.ts
│   ├── interactions/                 # Production Commands & Components
│   │   ├── command/
│   │   │   ├── command.ts
│   │   │   └── components/
│   │   │       ├── buttons/
│   │   │       ├── modals/
│   │   │       └── selectMenus/
│   │   └── test/                     # Sandbox/Testing Commands
│   │       ├── command/
│   │       └── components/
├── core/                             # Internal Framework Logic (Do not edit)
│   ├── events/                       # Base discord.js event listeners
│   ├── handlers/                     # Dynamic loaders for the /app folder
│   ├── services/                     # Command deployment scripts
│   └── types/                        # TypeScript interfaces & enums
├── data/                             # Database Layer
│   ├── functions/                    # DB logic and function classes
│   │   └── funcClass.ts
│   ├── schemas/                      # Database table/collection structures
│   │   └── schema1.sql
│   ├── database.ts                   # Centralized export hub for DB functions
│   ├── db.pool.ts                    # Connection pooling and initialization
│   └── order.json                    # Schema execution order
└── Bot.ts                            # Client initialization & entry point

```

