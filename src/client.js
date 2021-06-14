const { SnowflakeUtil, WebhookClient } = require("discord.js")
const createMessage = require("./createMessage")
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
        let sentReply = false
        const result = {
            id: interaction.id,
            token: interaction.token,
            client: client,
            channel: client.channels.cache.get(interaction.channel_id),
            guild: guild,
            member: await guild.members.fetch(interaction.member.user.id),
            author: await client.users.fetch(interaction.member.user.id),
            name: interaction.data.name,
            createdTimestamp: SnowflakeUtil.deconstruct(interaction.id).timestamp,
            options: interaction.data.options,
            async reply(cont, options = { ephermal: false, components: [] }) {
                const content = await createMessage(client, cont, interaction, options)
                const replyRequest = !sentReply
                    ? client.api.interactions(interaction.id, interaction.token).callback.post(content)
                    : client.api.webhooks(clientID, interaction.token).post(content.data);
                if (!sentReply) sentReply = true
                return replyRequest
            },
            async followup(cont) {
                if (!sentReply) throw new Error("The interaction was not replied to.")
                if (typeof cont != "string") throw new TypeError("Content must be a string")
                const whc = new WebhookClient(clientID, interaction.token)
                const res = await whc.send(cont)
                return res;
            },
            thinking(ephermal = false) {
                if (sentReply) return;
                sentReply = true
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5,
                        data: {
                            content: '',
                            flags: ephermal ? 64 : null
                        }
                    }
                })
            },
            delete(messageId = '@original') {
                client.api.webhooks(clientID, interaction.token).messages(messageId).delete();
            },
            async edit(cont, messageId = '@original', options) {
                const content = await createMessage(client, cont, interaction, options);
                if (!cont) {
                    throw new Error('No content');
                }
                const res = await client.api.webhooks(clientID, interaction.token).messages(messageId).patch(content.data)
                return res;
            },
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
    deleteCommand(commandID, guildID) {
        if (typeof commandID != "string") throw new TypeError("Invalid command ID.")
        if (!guildID) {
            this.client.api.applications(this.clientID).commands(commandID).delete()
        } else {
            if (typeof guildID != "string") throw new TypeError("Invalid guild ID!")
            this.client.api.applications(this.clientID).guilds(guildID).commands(commandID).delete()
        }
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
    async updateCommand(commandID, newCmd, guildID) {
        if (typeof commandID != "string") throw new TypeError("Invalid command ID.")
        if (typeof newCmd != 'object') throw new TypeError("Invalid command")
        let cmd;
        if (!guildID) {
            cmd = await this.client.api.applications(this.clientID).commands(commandID).patch({ data: newCmd })
        } else {
            if (typeof guildID != "string") throw new TypeError("Invalid guild ID.")
            cmd = await this.client.api.applications(this.clientID).guilds(guildID).commands(commandID).patch({ data: newCmd })
        }
        return cmd;
    }
    async findCommand(toFind, guildID) {
        let cmds;
        if (!guildID) {
            cmds = await this.getCommands()
        } else {
            if (typeof guildID != "string") throw new TypeError("Invalid guild ID.")
            cmds = await this.getCommands(guildID)
        }
        for (var i = 0; i < cmds.length; i++) {
            if (cmds[i].name === toFind) {
                return cmds[i];
            }
        }
    }
}
module.exports = Client
