const { discord } = require('../data/util/discord')
const leagues = require('../data/leagues')
const { COMMANDS, COMMAND_NAME } = require('../../shared/commands')
const { CALLBACKS } = require('./callbacks')

const BOT_ID = process.env.BOT_ID

discord.once('ready', () => {
  console.log('[bot] listening')
})

discord.on('message', async message => {
  let shortcut = false
  const parts = message.content.split(/\s+/)
  console.log('Message received!', message.guild.id, message.content, parts)

  if (!parts[0].match(BOT_ID)) {
    parts.unshift(BOT_ID)
    parts[1] = parts[1].split('!')[1]
    shortcut = true
  }

  const [_, _command, arg] = parts
  const context = message
  const command = Object.keys(COMMAND_NAME).find(name => {
    const config = COMMANDS[name]
    const match = (_command || '').toLowerCase()
    return (
      config.command === match ||
      (config.aliases && config.aliases.includes(match))
    )
  })

  if (!command) {
    if (!shortcut) {
      message.channel.send(
        'Sorry, I didn\'t understand that command. Try "@LeagueBot help" for more info.'
      )
    }
    return
  }

  if (shortcut) {
    const channelId = `${message.channel.id}`
    const found = await leagues.search({
      rules: [['channelId', '==', channelId]],
    })
    if (!found.length) return
  }

  try {
    await CALLBACKS[command](arg, context)
  } catch (err) {
    console.log(err)
  }
})
