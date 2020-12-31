const firebase = require('@firebase/rules-unit-testing')
const Discord = require('discord.js')
const { discord } = require('../data/util/discord')

const cleanDatabase = async () => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
}

const triggerMessage = async (data) => {
  const guild = await discord.guilds.fetch('h000')
  const message = new Discord.Message({
    ...data,
    guild,
  })
  await discord.trigger('message', message)
  return message
}

module.exports = { cleanDatabase, triggerMessage }
