const { discord } = require('../data/util/discord')
const leagues = require('../data/leagues')
const { onQueue, onUnqueue, onClear } = require('./queue')
const { onReportWin, onReportLoss } = require('./report')
const { onBubbles } = require('./bubbles')
const { onRoast } = require('./roast')
const { onCancel } = require('./cancel')
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
  CLEAR: 'clear',
  ROAST: 'roast',
  CANCEL: 'cancel',
  /* SECRET COMMANDS */
  BUBBLES: 'bubbles',
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
    context.channel.send(`https://www.leaguebotrl.com/?guildId=${context.guild.id}${teamSize ? `&teamSize=${teamSize}` : ''}`)
  },
  [COMMANDS.HELP]: (_, context) => {
    context.channel.send(messages.HELP())
  },
  [COMMANDS.TEST]: async (_, context) => {
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
  [COMMANDS.ROAST]: onRoast,
  [COMMANDS.CANCEL]: onCancel,

  /* SECRET */
  [COMMANDS.BUBBLES]: onBubbles,
}

discord.on('message', async message => {
  let shortcut = false
  const parts = message.content.split(/\s+/)
  console.log('Message received!', message.guild.id, message.content, parts)

  if (!parts[0].match(BOT_ID)) {
    parts.unshift(BOT_ID)
    parts[1] = parts[1].split('!')[1]
    shortcut = true
  }

  const [_, command, arg] = parts
  const context = message

  const action = ALIAS[command] || command

  if (shortcut) {
    const channelId = `${message.channel.id}`
    const found = await leagues.search({ rules: [['channelId', '==', channelId]] })
    if (!found.length) return
  }

  if (action && typeof MESSAGE_ACTIONS[action] === 'function') {
    try {
      await MESSAGE_ACTIONS[action](arg, context)
    } catch (err) {
      console.log(err)
    }
  } else if (!shortcut) {
    message.channel.send('Sorry, I didn\'t understand that command. Try "@LeagueBot help" for more info.')
  }
})