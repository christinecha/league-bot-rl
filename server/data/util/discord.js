const Discord = require('discord.js')

let client

const getClient = () => {
  if (!client) {
    client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })
    client.login(process.env.BOT_TOKEN)
  }
  return client
}

getClient()

module.exports = { discord: client }
