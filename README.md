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
        if(inter.name == "ping") return inter.reply("Pong!", true) // The true at the end makes it ephermal, you can remove it if you want it to be public. You can even pass in an embed!
    })
})
client.login("TOKEN")
```
