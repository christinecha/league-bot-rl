require('dotenv').config()

const Discord = require('discord.js')
const leagues = require('./data/leagues')
const queue = require('./queue')
const client = new Discord.Client()

const BOT_ID = process.env.BOT_ID

client.once('ready', () => {
  console.log('League Bot Ready!')
})

const COMMANDS = {
  QUEUE: 'queue',
  NEW: 'new',
}

const ALIAS = {
  q: COMMANDS.QUEUE,
  join: COMMANDS.QUEUE,
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
  [COMMANDS.QUEUE]: queue,
}

client.on('message', async message => {
  const parts = message.content.split(' ')
  if (parts[0] !== `<@!${BOT_ID}>`) return

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

client.login(process.env.BOT_TOKEN)