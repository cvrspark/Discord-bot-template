import { Events } from 'discord.js';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
};

export default {
    name: Events.ClientReady,
    once: true,
    execute(client: any) {
        console.clear();
        console.log(`${colors.white}${colors.bright}Started ${colors.cyan}${client.user.tag}${colors.reset}`);
        console.log(`${colors.white}${colors.bright}Bot made by ${colors.magenta}cvrspark (@swaglimit)${colors.reset}`);
    },
};
