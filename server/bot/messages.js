const Discord = require('discord.js')
const { parseMatchId } = require('../data/matchId')
const { getCommandsMarkdown } = require('../../shared/getCommandsMarkdown')
const { usersToString, queueToString } = require('../util')

const COLOR_PRIMARY = '#4c33ff'

const LEAVE_QUEUE = ({ userId, teamSize }) => {
  if (teamSize) {
    return `<@!${userId}> has been removed from the ${teamSize}s queue.`
  }

  return `<@!${userId}> has been removed from all queues.`
}

const GET_MATCH_MODE = ({ playerIds, teamSize }) => {
  return new Discord.MessageEmbed().setColor(COLOR_PRIMARY).addFields({
    name: `We've got a ${teamSize}s match!`,
    value: `${usersToString(playerIds)}

Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.
`,
  })
}

const CREATE_MATCH = match => {
  const { players, teamSize, mode } = match
  const team1 = Object.keys(players)
    .sort()
    .filter(p => players[p].team === 1)
  const team2 = Object.keys(players)
    .sort()
    .filter(p => players[p].team === 2)
  const { key } = parseMatchId(match.id)

  return new Discord.MessageEmbed()
    .setColor(COLOR_PRIMARY)
    .setTitle(`${teamSize}s Match`)
    .setDescription(`Match ID: ${key}`)
    .addFields(
      { name: 'Team 1', value: usersToString(team1) },
      { name: 'Team 2', value: usersToString(team2) }
    )
    .setTimestamp()
    .setFooter(
      `Teams were ${mode === 'auto' ? 'auto-balanced' : 'selected randomly'}`
    )
}

const QUEUE = league => {
  const { queue, teamSize } = league

  const queueList = Object.keys(queue).length
    ? queueToString(queue)
    : 'No one in the queue.'

  return new Discord.MessageEmbed()
    .setColor(COLOR_PRIMARY)
    .addFields({ name: `${teamSize}s League Queue`, value: queueList })
    .setTimestamp()
}

const HELP = () => {
  return new Discord.MessageEmbed().setColor(COLOR_PRIMARY).addFields(
    {
      name: 'Variables',
      value: `
- \`league\` - Either "1s", "2s", or "3s".
- \`matchId\` - The "id" specified in a created match.
      `,
    },
    {
      name: 'Commands',
      value: getCommandsMarkdown(),
    },
    {
      name: 'Advanced',
      value: `
- Mentioning \`@LeagueBot\` is optional in the channel that has most recently been queued in. As a shortcut in this channel, you can use a \`!\` prefix instead, like \`!leave 2s\`, \`!q 1\` or \`!leaderboard\`
      `,
    }
  )
}

module.exports = {
  LEAVE_QUEUE,
  GET_MATCH_MODE,
  CREATE_MATCH,
  QUEUE,
  HELP,
}
