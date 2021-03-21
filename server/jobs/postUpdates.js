require('dotenv').config()
const { discord } = require('../data/util/discord')
const postUpdates = require('../postUpdates')

discord.once('ready', () => {
  console.log('[bot] listening')
  postUpdates()
})
