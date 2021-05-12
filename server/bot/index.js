const { discord } = require('../data/util/discord')
const guilds = require('../data/guilds')
const ERRORS = require('../constants/ERRORS')
const { COMMANDS, COMMAND_NAME } = require('../../shared/commands')
const { CALLBACKS } = require('./callbacks')

const BOT_ID = process.env.BOT_ID

discord.once('ready', () => {
  console.log('[bot] listening')
})

discord.on('message', async (message) => {
  let prefixed = false
  const parts = message.content.split(/\s+/)

  if (!parts[0].match(BOT_ID)) {
    parts.unshift(parts[0][0]) // save prefix
    parts[1] = parts[1].substr(1)
    prefixed = true
  }

  const [prefix, _command, ...args] = parts
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
    if (!prefixed) {
      message.channel.send(
        'Sorry, I didn\'t understand that command. Try "@LeagueBot help" for more info.'
      )
    }
    return
  }

  const guild = await guilds.get(message.guild.id)
  const guildPrefix = (guild && guild.prefix) || '!'

  if (prefixed && prefix !== guildPrefix) {
    return
  }

  if (COMMANDS[command].modOnly) {
    const mods = guild && guild.mods ? Object.keys(guild.mods) : []
    const authorId = message.author.id
    const guildMember = await context.guild.members.fetch(authorId)
    const isAdmin =
      guildMember.hasPermission(['ADMINISTRATOR']) ||
      mods.indexOf(authorId) > -1

    if (!isAdmin) {
      message.channel.send(ERRORS.MOD_ONLY)
      return
    }
  }

  try {
    console.log('Command received!', command, args)

    const guildUpdate = {
      id: message.guild.id,
      name: message.guild.name,
      ownerID: message.guild.ownerID,
      lastUpdate: Date.now(),
    }

    if (!guild) {
      await guilds.create(guildUpdate)
    } else {
      await guilds.update(guildUpdate)
    }

    await CALLBACKS[command](context, ...args)
  } catch (err) {
    console.log(err)
  }
})
