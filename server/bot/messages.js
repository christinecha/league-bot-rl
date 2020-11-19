const Discord = require('discord.js')
const { parseMatchId } = require('../data/matchId')

const GET_MATCH_MODE = ({ playerIds, teamSize }) => {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .addFields(
      {
        name: `We've got a ${teamSize}s match!`,
        value: playerIds.map(id => `<@!${id}>`).join(' ')
      },
      {
        value: 'Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.'
      },
    )
}

const CREATE_MATCH = (match) => {
  const { players, teamSize, mode } = match
  const team1 = Object.keys(players).filter(p => players[p].team === 1)
  const team2 = Object.keys(players).filter(p => players[p].team === 2)
  const { key } = parseMatchId(match.id)

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${teamSize}s Match`)
    // .setURL('https://discord.js.org/')
    // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription(`Match ID: ${key} • Mode: ${mode}`)
    // .setThumbnail('https://i.imgur.com/wSTFkRM.png')
    .addFields(
      { name: 'Team 1', value: team1.map(id => `<@!${id}>`).join(' ') },
      { name: 'Team 2', value: team2.map(id => `<@!${id}>`).join(' ') },
    )
    .setTimestamp()
  // .setFooter('Some footer text here');
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

const HELP = () => {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .addFields(
      {
        name: 'Variables', value: `
- \`league-name\` - Either "1s", "2s", or "3s".
- \`match-id\` - The "id" specified in a created match.
      `},
      {
        name: 'Commands', value: `
- \`@LeagueBot new | n [league-name]\` - Create new league
- \`@LeagueBot queue | q [league-name]\` - Join active queue for a league
- \`@LeagueBot leave | l [league-name]\` - Leave active queue for a league
- \`@LeagueBot leaderboard [league-name]\` - Show leaderboard for a league
- \`@LeagueBot win | won [match-id]\` - Report match as a win for your team!
- \`@LeagueBot lose | loss | lost [match-id]\` - Report match as a loss. :(
      `},
    )
}

module.exports = {
  GET_MATCH_MODE,
  CREATE_MATCH,
  QUEUE,
  HELP
}