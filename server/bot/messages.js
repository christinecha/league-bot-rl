const Discord = require('discord.js')
const { parseMatchId } = require('../data/matchId')
const { getCommandsMarkdown } = require('../../shared/getCommandsMarkdown')
const { usersToString, queueToString, getTeams } = require('../util')
const { getVariablesMarkdown } = require('../../shared/getVariablesMarkdown')
const { getAdvancedMarkdown } = require('../../shared/getAdvancedMarkdown')

const COLOR_PRIMARY = '#4c33ff'

const LEADERBOARD_NOT_RESET = (teamSize) =>
  `${teamSize}s Leaderboard was not reset.`
const LEADERBOARD_RESET = (teamSize) => `${teamSize}s Leaderboard was reset.`

const REACT_TO_RESET = (teamSize) =>
  `Are you sure you want to reset the ${teamSize}s Leaderboard? React with an emote to confirm. This action cannot be undone.`

const REACT_TO_OVERWRITE = () =>
  'To overwrite the results of this match, react below with the correct team that won.'

const TEAM_WON = ({ winner, matchKey }) =>
  `Team ${winner} won Match #${matchKey}!`

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

const MATCH_DETAILS = (match) => {
  const { players, teamSize, mode } = match
  const teams = getTeams(players)
  const { key } = parseMatchId(match.id)

  return new Discord.MessageEmbed()
    .setColor(COLOR_PRIMARY)
    .setTitle(`${teamSize}s Match`)
    .setDescription(`Match ID: ${key}`)
    .addFields(
      { name: 'Team 1', value: usersToString(teams[1]) },
      { name: 'Team 2', value: usersToString(teams[2]) }
    )
    .setTimestamp()
    .setFooter(
      `Teams were ${mode === 'auto' ? 'auto-balanced' : 'selected randomly'}`
    )
}

const QUEUE = (league) => {
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
      value: getVariablesMarkdown(),
    },
    {
      name: 'Commands',
      value: getCommandsMarkdown(),
    },
    {
      name: 'Advanced',
      value: getAdvancedMarkdown(),
    }
  )
}

module.exports = {
  LEAVE_QUEUE,
  GET_MATCH_MODE,
  MATCH_DETAILS,
  QUEUE,
  HELP,
  REACT_TO_OVERWRITE,
  TEAM_WON,
  LEADERBOARD_RESET,
  LEADERBOARD_NOT_RESET,
  REACT_TO_RESET,
}
