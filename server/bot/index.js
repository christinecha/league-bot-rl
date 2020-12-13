const { discord } = require('../data/util/discord')
const leagues = require('../data/leagues')
const { onQueue, onUnqueue, onClear } = require('./queue')
const { onReportWin, onReportLoss } = require('./report')
const { onStatus } = require('./status')
const messages = require('./messages')
const { getTeamSize, getLeagueId } = require('./util')

const BOT_ID = process.env.BOT_ID

discord.once('ready', () => {
  console.log('[bot] listening')
})

const COMMANDS = {
  QUEUE: 'queue',
  STATUS: 'status',
  LEAVE: 'leave',
  NEW: 'new',
  WIN: 'win',
  LOSS: 'loss',
  LEADERBOARD: 'leaderboard',
  HELP: 'help',
  TEST: 'test',
  CLEAR: 'clear'
}

const ALIAS = {
  q: COMMANDS.QUEUE,
  l: COMMANDS.LEAVE,
  n: COMMANDS.NEW,
  join: COMMANDS.QUEUE,
  won: COMMANDS.WIN,
  lose: COMMANDS.LOSS,
  lost: COMMANDS.LOSS,
  h: COMMANDS.HELP,
  s: COMMANDS.STATUS
}

const MESSAGE_ACTIONS = {
  [COMMANDS.NEW]: async (leagueName, context) => {
    let teamSize

    try {
      teamSize = getTeamSize(leagueName)
    } catch (err) {
      context.channel.send(err)
      return
    }

    const id = getLeagueId(teamSize, context)
    const existing = await leagues.get(id)

    if (existing) {
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
    context.channel.send(`https://www.leaguebotrl.com/?guildId=${context.guild.id}&teamSize=${teamSize}`)
  },
  [COMMANDS.HELP]: (context) => {
    context.channel.send(messages.HELP())
  },
  [COMMANDS.TEST]: async (context) => {
    const embed = messages.HELP()
    const message = await context.channel.send(embed)

    message.react('🤖')
    message.react('👻')

    const filter = (reaction, user) => reaction.emoji.name === '👌' && user.id === 'someID'
    message.awaitReactions(filter, { time: 15000 })
      .then(collected => console.log(`Collected ${collected.size} reactions`))
      .catch(console.error)
  },
  [COMMANDS.CLEAR]: onClear,
  [COMMANDS.STATUS]: onStatus,
}

discord.on('message', async message => {
  const parts = message.content.split(/\s+/)
  console.log('Message received!', message.guild.id, message.content, parts)

  if (!parts[0].match(BOT_ID)) return

  const [_, command, arg] = parts
  const context = message

  const action = ALIAS[command] || command

  if (action && MESSAGE_ACTIONS[action]) {
    try {
      await MESSAGE_ACTIONS[action](arg, context)
    } catch (err) {
      console.log(err)
    }
  } else {
    message.channel.send('Sorry, I didn\'t understand that command.')
  }
})