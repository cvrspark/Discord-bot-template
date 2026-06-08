import { Client } from "discord.js";
import handleCommands from "./handleCommands";
import handleClientEvents from "./handleClientEvents";
import handleEvents from "./handleEvents";
import handleComponents from "./handleComponents";

import handleTestCommands from "./handleTestCommands"
import handleTestComponents from "./handleTestComponents"

export default async function handleInteractions(client: Client) {
    try {
        await handleClientEvents(client)
        await handleEvents(client)   
        await handleCommands(client)   
        await handleComponents(client)
        
        await handleTestCommands(client)
        await handleTestComponents(client)
    } catch (error) {
        console.log("Error in final handler", error)
    }
}