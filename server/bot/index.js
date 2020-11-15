const { discord } = require('../data/util/discord')
const leagues = require('../data/leagues')
const { onQueue, onUnqueue } = require('./queue')
const { onReportWin, onReportLoss } = require('./report')

const BOT_ID = process.env.BOT_ID

discord.once('ready', () => {
  console.log('[bot] listening')
})

const COMMANDS = {
  QUEUE: 'queue',
  LEAVE: 'leave',
  NEW: 'new',
  WIN: 'win',
  LOSS: 'loss',
  LEADERBOARD: 'leaderboard',
}

const ALIAS = {
  q: COMMANDS.QUEUE,
  l: COMMANDS.LEAVE,
  n: COMMANDS.NEW,
  join: COMMANDS.QUEUE,
  won: COMMANDS.WIN,
  lose: COMMANDS.LOSS,
  lost: COMMANDS.LOSS,
}

const MESSAGE_ACTIONS = {
  [COMMANDS.NEW]: async (leagueName, context) => {
    const teamSize = parseInt(leagueName)

    if (![1, 2, 3].includes(teamSize)) {
      context.channel.send(`Team size ${teamSize} is invalid. Choose 1, 2, or 3.`)
      return
    }

    const id = `${context.guild.id}-${teamSize}`

    const existing = await leagues.get(id)

    if (existing) {
      console.log('Existing!', existing)
      context.channel.send(`A league with team size ${teamSize} already exists in this server.`)
      return
    }

    context.channel.send(`Creating a new league with team size ${teamSize}.`)
    await leagues.create({ id, teamSize, name: `${teamSize}s` })
  },
  [COMMANDS.QUEUE]: onQueue,
  [COMMANDS.LEAVE]: onUnqueue,
  [COMMANDS.WIN]: onReportWin,
  [COMMANDS.LOSS]: onReportLoss,
  [COMMANDS.LEADERBOARD]: (teamSize, context) => {
    context.channel.send(`https://cha-discord-league-bot.herokuapp.com/?guildId=${context.guild.id}&teamSize=${teamSize}`)
  }
}

discord.on('message', async message => {
  const parts = message.content.split(/\s+/)
  console.log('Message received!', message.guild.id, message.content, parts)

  if (![`<@!${BOT_ID}>`, `<@${BOT_ID}>`].includes(parts[0])) return

  const [_, command, ...args] = parts
  const context = message

  const action = ALIAS[command] || command

  if (action && MESSAGE_ACTIONS[action]) {
    try {
      await MESSAGE_ACTIONS[action](...args, context)
    } catch (err) {
      console.log(err)
    }
  }
})