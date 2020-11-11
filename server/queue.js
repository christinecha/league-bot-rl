const Discord = require('discord.js')
const leagues = require('./data/leagues')
const createMatch = require('./createMatch')

const getMatchMessage = (match) => {
  const players1 = Object.keys(match.team1)
  const players2 = Object.keys(match.team2)

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Match!!!')
    // .setURL('https://discord.js.org/')
    // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription(`id: ${match.id}`)
    // .setThumbnail('https://i.imgur.com/wSTFkRM.png')
    .addFields(
      { name: 'Team 1', value: players1.map(id => `<@!${id}>`).join(' ') },
      { name: 'Team 2', value: players2.map(id => `<@!${id}>`).join(' ') },
    )
    // .addField('Inline field title', 'Some value here', true)
    // .setImage('https://i.imgur.com/wSTFkRM.png')
    .setTimestamp()
    .setFooter('Some footer text here');
}

const queue = async (leagueName, context) => {
  const teamSize = parseInt(leagueName)

  if (![1, 2, 3].includes(teamSize)) {
    context.channel.send(`Team size ${teamSize} is invalid. Choose 1, 2, or 3.`)
    return
  }

  const id = `${context.guild.id}-${teamSize}`
  const league = await leagues.get(id)

  if (!league) {
    context.channel.send(`A league with team size ${teamSize} does not exist in this server.`)
    return
  }

  const queue = league.queue || {}

  if (queue[context.author.id]) {
    context.channel.send(`You are already in this queue!`)
    return
  }

  const newQueueData = { [`queue.${context.author.id}`]: Date.now() }

  await leagues.update({ id, ...newQueueData })
  context.channel.send(`You have been added to the queue.`)

  const queueLength = Object.keys(queue).length + 1

  if (queueLength >= teamSize * 2) {
    context.channel.send(`Creating new match...`)
    const match = await createMatch(league.id)
    context.channel.send(getMatchMessage(match))
  }
}

module.exports = queue