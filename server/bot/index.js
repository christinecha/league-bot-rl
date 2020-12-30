const { discord } = require('../data/util/discord')
const leagues = require('../data/leagues')
const guilds = require('../data/guilds')
const { COMMANDS, COMMAND_NAME } = require('../../shared/commands')
const { CALLBACKS } = require('./callbacks')

const BOT_ID = process.env.BOT_ID

discord.once('ready', () => {
  console.log('[bot] listening')
})

discord.on('message', async (message) => {
  let shortcut = false
  const parts = message.content.split(/\s+/)

  if (!parts[0].match(BOT_ID)) {
    parts.unshift(BOT_ID)
    parts[1] = parts[1].split('!')[1]
    shortcut = true
  }

  const [_, _command, arg] = parts
  const context = message
  const command = Object.keys(COMMAND_NAME).find((name) => {
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

  if (COMMANDS[command].modOnly) {
    const guildMember = await context.guild.members.fetch(message.author.id)
    const isAdmin = guildMember.hasPermission(['ADMINISTRATOR'])

    if (!isAdmin) {
      message.channel.send('You must be a LeagueBot mod to use this command.')
      return
    }
  }

  if (shortcut) {
    const channelId = `${message.channel.id}`
    const found = await leagues.search({
      rules: [['channelId', '==', channelId]],
    })
    if (!found.length) return
  }

  try {
    console.log('Command received!', command, arg)
    await guilds.create({
      id: message.guild.id,
      name: message.guild.name,
      ownerID: message.guild.ownerID,
      lastUpdate: Date.now(),
    })
    await CALLBACKS[command](arg, context)
  } catch (err) {
    console.log(err)
  }
})
