const Discord = require('discord.js')
const client = new Discord.Client()

client.login(process.env.BOT_TOKEN)

module.exports = { discord: client }
