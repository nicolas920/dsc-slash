const { APIMessage } = require("discord.js")
async function createMessage(client, content, interaction, options = { ephermal: false, components: [] }) {
    let cont;
    let components;
    if (typeof options != "object") options = { ephermal: false, components: [] }
    if (!options.components) options = { ephermal: options.ephermal, components: [] }
    components = options.components
    if (typeof content == "object") {
        const apiMessage = await APIMessage.create(client.channels.resolve(interaction.channel_id), content)
            .resolveData()
            .resolveFiles()
        if (options.ephermal) {
            if (options.components[0]) {
                cont = {
                    data: {
                        type: 4,
                        data: {
                            ...apiMessage.data,
                            files: apiMessage.files,
                            flags: 64,
                            components: [
                                {
                                    type: 1,
                                    components: components
                                }
                            ]
                        }
                    }
                }
            } else {
                cont = {
                    data: {
                        type: 4,
                        data: {
                            ...apiMessage.data,
                            files: apiMessage.files,
                            flags: 64
                        }
                    }
                }
            }
        } else {
            if (options.components[0]) {
                cont = {
                    data: {
                        type: 4,
                        data: {
                            ...apiMessage.data,
                            files: apiMessage.files,
                            components: [
                                {
                                    type: 1,
                                    components: components
                                }
                            ]
                        }
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
        }
    } else {
        if (options.ephermal) {
            if (options.components[0]) {
                cont = {
                    data: {
                        type: 4,
                        data: {
                            content: content,
                            flags: 64,
                            components: [
                                {
                                    type: 1,
                                    components: components
                                }
                            ]
                        }
                    }
                }
            } else {
                cont = {
                    data: {
                        type: 4,
                        data: {
                            content: content,
                            flags: 64
                        }
                    }
                }
            }
        } else {
            if (options.components[0]) {
                cont = {
                    data: {
                        type: 4,
                        data: {
                            content: content,
                            components: [
                                {
                                    type: 1,
                                    components: components
                                }
                            ]
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
    }
    return cont;
}
module.exports = createMessage
