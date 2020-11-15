const Discord = require('discord.js')
const { parseMatchId } = require('../data/matchId')

const CREATE_MATCH = (match) => {
  const { players, teamSize } = match
  const team1 = Object.keys(players).filter(p => players[p].team === 1)
  const team2 = Object.keys(players).filter(p => players[p].team === 2)
  const { key } = parseMatchId(match.id)

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${teamSize}s Match!!!`)
    // .setURL('https://discord.js.org/')
    // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription(`ID: ${key}`)
    // .setThumbnail('https://i.imgur.com/wSTFkRM.png')
    .addFields(
      { name: 'Team 1', value: team1.map(id => `<@!${id}>`).join(' ') },
      { name: 'Team 2', value: team2.map(id => `<@!${id}>`).join(' ') },
    )
    .setTimestamp()
    .setFooter('Some footer text here');
}

const QUEUE = (league) => {
  const { queue, teamSize } = league
  const players = Object.keys(queue)

  const queueList = players.length
    ? players.map(id => `<@!${id}>`).join(' ')
    : 'No one in the queue.'

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .addFields(
      { name: `${teamSize}s League Queue`, value: queueList },
    )
    .setTimestamp()
}

module.exports = {
  CREATE_MATCH,
  QUEUE
}