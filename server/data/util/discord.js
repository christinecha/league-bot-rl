const Discord = require('discord.js')

let client

const getClient = () => {
  if (!client) {
    client = new Discord.Client()
    client.login(process.env.BOT_TOKEN)
  }
  return client
}

getClient()

module.exports = { discord: client }
