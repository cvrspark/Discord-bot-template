import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import config from "../../../config.json"

const token = config.token;
const appid = config.clientId;
const emojidir = path.join(__dirname, '../../../assets/emojis');
const configpath = path.join(__dirname, "./config.ts");

async function getExistingEmojis() {
    const response = await fetch(`https://discord.com/api/v10/applications/${appid}/emojis`, {
        headers: { 'Authorization': `Bot ${token}` }
    });
    const data = await response.json();
    return data.items || [];
}

async function uploadEmoji(filePath: string) {
    let name = path.parse(filePath).name.replace(/[^a-zA-Z0-9]/g, '_');
    if (name.length < 2) name = name.padEnd(2, '_');

    const buffer = await sharp(filePath).toBuffer();
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

    const upload = async () => {
        return await fetch(`https://discord.com/api/v10/applications/${appid}/emojis`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, image: base64 }),
        });
    };

    let response = await upload();

    if (response.status === 400) {
        const errorData = await response.json();
        if (JSON.stringify(errorData).includes("APPLICATION_EMOJI_NAME_ALREADY_TAKEN")) {
            console.log(`Emoji ${name} exists. Overriding...`);
            const existing = await getExistingEmojis();
            const target = existing.find((e: any) => e.name === name);
            
            if (target) {
                await fetch(`https://discord.com/api/v10/applications/${appid}/emojis/${target.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bot ${token}` }
                });
                response = await upload();
            }
        }
    }

    if (!response.ok) throw new Error(`Failed to upload ${name}: ${await response.text()}`);
    return await response.json();
}

async function run() {
    const files = (await fs.readdir(emojidir)).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
    const newEmojiMap: Record<string, string> = {};

    for (const file of files) {
        console.log(`Processing ${file}...`);
        try {
            const emoji = await uploadEmoji(path.join(emojidir, file));
            newEmojiMap[emoji.name] = `<:${emoji.name}:${emoji.id}>`;
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
            console.error(`Skipping ${file}:`, err);
        }
    }

    let configContent = await fs.readFile(configpath, 'utf8');
    const newEmojiLines = Object.entries(newEmojiMap)
        .map(([name, val]) => `    static ${name} = "${val}"`)
        .join('\n');

    const emojiRegex = /export class Emojis \{[\s\S]*?\}/;
    const replacement = `export class Emojis {\n${newEmojiLines}\n}`;

    if (emojiRegex.test(configContent)) {
        configContent = configContent.replace(emojiRegex, replacement);
    } else {
        configContent += `\n${replacement}`;
    }

    await fs.writeFile(configpath, configContent);
    console.log("Successfully updated config.ts with new emojis!");
}

run().catch(console.error);