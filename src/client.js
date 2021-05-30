const { APIMessage, SnowflakeUtil, WebhookClient } = require("discord.js")
async function createMessage(client, content, ephermal = false, interaction) {
    let cont;
    if (typeof content == "object") {
        const apiMessage = await APIMessage.create(client.channels.resolve(interaction.channel_id), content)
            .resolveData()
            .resolveFiles()
        if (ephermal) {
            cont = {
                data: {
                    type: 4,
                    data: { ...apiMessage.data, files: apiMessage.files, flags: 64 }
                }
            }
        } else {
            cont = {
                data: {
                    type: 4,
                    data: { ...apiMessage.data, files: apiMessage.files }
                }
            }
        }
    } else {
        if (ephermal) {
            cont = {
                data: {
                    type: 4,
                    data: {
                        content: content,
                        flags: 64
                    }
                }
            }
        } else {
            cont = {
                data: {
                    type: 4,
                    data: {
                        content: content
                    }
                }
            }
        }
    }
    return cont;
}
class Client {
    constructor(client, id) {
        if (typeof client != "object") throw new TypeError("Client is invalid")
        this.client = client
        if (typeof id != "string") throw new TypeError("Invalid ID!")
        this.clientID = id
    }
    async parseInteraction(interaction) {
        const client = this.client;
        const clientID = this.clientID;
        const guild = await client.guilds.fetch(interaction.guild_id)
        const result = {
            id: interaction.id,
            token: interaction.token,
            channel: client.channels.cache.get(interaction.channel_id),
            guild: guild,
            member: await guild.members.fetch(interaction.member.user.id),
            author: await client.users.fetch(interaction.member.user.id),
            name: interaction.data.name,
            createdTimestamp: SnowflakeUtil.deconstruct(interaction.id).timestamp,
            options: interaction.data.options,
            async reply(cont, ephermal = false) {
                const content = await createMessage(client, cont, ephermal, interaction)
                const res = await client.api.interactions(interaction.id, interaction.token).callback.post(content)
                return res;
            },
            async followup(cont) {
                const whc = new WebhookClient(clientID, interaction.token)
                const res = await whc.send(cont)
                return res;
            }
        }
        return result;
    }
    async postCommand(command, guildID) {
        if (typeof command != "object") throw new TypeError("Invalid command type!")
        let result;
        if (!guildID) {
            result = await this.client.api.applications(this.clientID).commands.post({ data: command })
        } else {
            if (typeof guildID != "string") throw new TypeError("Invalid guild ID!")
            result = await this.client.api.applications(this.clientID).guilds(guildID).commands.post({ data: command })
        }
        return result;
    }
    async deleteCommand(commandID, guildID) {
        if (typeof commandID != "string") throw new TypeError("Invalid command ID.")
        let result;
        if (!guildID) {
            result = await this.client.api.applications(this.clientID).commands(commandID).delete()
        } else {
            if (typeof guildID != "string") throw new TypeError("Invalid guild ID!")
            result = await this.client.api.applications(this.clientID).guilds(guildID).commands(commandID).delete()
        }
        return result;
    }
    async getCommands(guildID) {
        let commands;
        if (!guildID) {
            commands = await this.client.api.applications(this.clientID).commands.get()
        } else {
            if (typeof guildID != "string") throw new TypeError("Invalid guild ID.")
            commands = await this.client.api.applications(this.clientID).guilds(guildID).commands.get()
        }
        return commands;
    }
    async updateCommand(commandID, guildID, newCmd) {
        if (typeof commandID != "string") throw new TypeError("Invalid command ID.")
        if(typeof newCmd != 'object') throw new TypeError("Invalid command")
        if (!guildID) {
            this.client.api.applications(this.clientID).commands(commandID).patch(newCmd)
        } else {
            if (typeof guildID != "string") throw new TypeError("Invalid guild ID.")
            this.client.api.applications(this.clientID).guilds(guildID).commands(commandID).patch(newCmd)
        }
    }
    async findCommand(toFind, commands) {
        for (var i = 0; i < commands.length; i++) {
            if (commands[i].name === toFind) {
                return commands[i];
            }
        }
    }
}
module.exports = Client