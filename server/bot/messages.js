const Discord = require('discord.js')
const { parseMatchId } = require('../data/matchId')

const LEAVE_QUEUE = ({ userId, teamSize }) => {
  if (teamSize) {
    return `<@!${userId}> has been removed from the ${teamSize}s queue.`
  }

  return `<@!${userId}> has been removed from all queues.`
}

const GET_MATCH_MODE = ({ playerIds, teamSize }) => {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .addFields(
      {
        name: `We've got a ${teamSize}s match!`,
        value: `${playerIds.map(id => `<@!${id}>`).join(' ')}

Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.
`
      },
    )
}

const CREATE_MATCH = (match) => {
  const { players, teamSize, mode } = match
  const team1 = Object.keys(players).sort().filter(p => players[p].team === 1)
  const team2 = Object.keys(players).sort().filter(p => players[p].team === 2)
  const { key } = parseMatchId(match.id)

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${teamSize}s Match`)
    .setDescription(`Match ID: ${key}`)
    .addFields(
      { name: 'Team 1', value: team1.map(id => `<@!${id}>`).join(' ') },
      { name: 'Team 2', value: team2.map(id => `<@!${id}>`).join(' ') },
    )
    .setTimestamp()
    .setFooter(`Teams were ${mode === 'auto' ? 'auto-balanced' : 'selected randomly'}`);
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
- \`@LeagueBot queue | q [league-name]\` - Join queue for a league
- \`@LeagueBot leave | l\` - Leave all league queues
- \`@LeagueBot leave | l [league-name]\` - Leave queue for a league
- \`@LeagueBot status | s\` - Show the queues of all leagues
- \`@LeagueBot status | s [league-name]\` - Show the queue for a league
- \`@LeagueBot clear [league-name]\` - Clear the queue for a league
- \`@LeagueBot leaderboard [league-name]\` - Show leaderboard for a league
- \`@LeagueBot win | won [match-id]\` - Report match as a win for your team!
- \`@LeagueBot lose | loss | lost [match-id]\` - Report match as a loss. :(
      `},
    )
}

module.exports = {
  LEAVE_QUEUE,
  GET_MATCH_MODE,
  CREATE_MATCH,
  QUEUE,
  HELP
}