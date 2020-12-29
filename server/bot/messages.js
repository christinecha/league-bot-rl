const Discord = require('discord.js')
const { parseMatchId } = require('../data/matchId')
const { COMMANDS } = require('../../shared/commands')

const LEAVE_QUEUE = ({ userId, teamSize }) => {
  if (teamSize) {
    return `<@!${userId}> has been removed from the ${teamSize}s queue.`
  }

  return `<@!${userId}> has been removed from all queues.`
}

const GET_MATCH_MODE = ({ playerIds, teamSize }) => {
  return new Discord.MessageEmbed().setColor('#0099ff').addFields({
    name: `We've got a ${teamSize}s match!`,
    value: `${playerIds.map(id => `<@!${id}>`).join(' ')}

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
    .setColor('#0099ff')
    .setTitle(`${teamSize}s Match`)
    .setDescription(`Match ID: ${key}`)
    .addFields(
      { name: 'Team 1', value: team1.map(id => `<@!${id}>`).join(' ') },
      { name: 'Team 2', value: team2.map(id => `<@!${id}>`).join(' ') }
    )
    .setTimestamp()
    .setFooter(
      `Teams were ${mode === 'auto' ? 'auto-balanced' : 'selected randomly'}`
    )
}

const QUEUE = league => {
  const { queue, teamSize } = league
  const players = Object.keys(queue).sort((a, b) => queue[a] - queue[b])

  const queueList = players.length
    ? players.map(id => `<@!${id}>`).join(' ')
    : 'No one in the queue.'

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .addFields({ name: `${teamSize}s League Queue`, value: queueList })
    .setTimestamp()
}

const HELP = () => {
  const commands = Object.values(COMMANDS)
    .filter(c => !c.isHidden)
    .sort((a, b) => (a.command > b.command ? 1 : -1))
    .map(c => {
      const aliases =
        c.aliases && c.aliases.length ? ` | ${c.aliases.join(' | ')}` : ''

      const args = c.argument ? ` <${c.argument}>` : ''
      return `- \`@LeagueBot ${c.command}${aliases}${args}\` - ${c.description}`
    })
  return new Discord.MessageEmbed().setColor('#0099ff').addFields(
    {
      name: 'Variables',
      value: `
- \`league\` - Either "1s", "2s", or "3s".
- \`matchId\` - The "id" specified in a created match.
      `,
    },
    {
      name: 'Commands',
      value: commands,
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
