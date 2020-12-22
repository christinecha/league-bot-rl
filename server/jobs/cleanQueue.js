require('dotenv').config()
const { discord } = require('../data/util/discord')
const cleanQueue = require('../cleanQueue')

discord.once('ready', () => {
  console.log('[bot] listening')
  cleanQueue()
})
