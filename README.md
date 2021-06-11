# Discord Slash (dsc-slash)
A simple but powerful slash command module for Discord.js!
Discord Slash does NOT mess with any Discord.js files, and is done from the module itself and your Discord client.
## Installation
`npm i dsc-slash`
## Example
```js
const Discord = require("discord.js")
const slash = require("dsc-slash")
const client = new Discord.Client()
client.on("ready", async () => {
    console.log("Ready!")
    const int = new slash.Client(client, client.user.id)
    const command = {
        name: "ping",
        description: "Pong!"
    }
    const cmd = await int.postCommand(command, "someGuildID") // Guild ID is optional
    console.log(cmd)
    client.ws.on("INTERACTION_CREATE", async interaction => {
        const inter = await int.parseCommand(interaction)
        if(inter.name == "ping") return inter.reply("Pong!", { ephermal: true }) // You can leave the ephermal out if you don't want it.
    })
})
client.login("TOKEN")
```
## Support
Not sure how to use Discord Slash? Here are some resources:
[Discord Slash Documentation](https://slash.dluxe.ml)
[Support Server](https://discord.gg/hqwZ5CpuVz)
