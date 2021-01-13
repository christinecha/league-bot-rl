const Discord = require('discord.js')
const { parseMatchId } = require('../data/matchId')
const {
  getCommandsMarkdown,
  getModCommandsMarkdown,
} = require('../../shared/getCommandsMarkdown')
const { usersToString, queueToString, getTeams } = require('../util')
const { getVariablesMarkdown } = require('../../shared/getVariablesMarkdown')
const { getAdvancedMarkdown } = require('../../shared/getAdvancedMarkdown')

const COLOR_PRIMARY = '#4c33ff'

const MATCH_VOIDED = (matchKey) => `Match ${matchKey} was voided.`
const MATCH_NOT_VOIDED = (matchKey) => `Match ${matchKey} was not voided.`
const REACT_TO_VOID = (matchKey) =>
  `Are you sure you want to erase match ${matchKey} from history? React with any emote to confirm. This action cannot be undone.`
const LEADERBOARD_NOT_RESET = (teamSize) =>
  `${teamSize}s Leaderboard was not reset.`
const LEADERBOARD_RESET = (teamSize) => `${teamSize}s Leaderboard was reset.`

const LEADERBOARD_START = ({ teamSize, date }) =>
  `${teamSize}s Leaderboard now starts from ${date}.`

const LEADERBOARD_END = ({ teamSize, date }) =>
  `${teamSize}s Leaderboard now ends at ${date}.`

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
      name: 'Mod-Only Commands',
      value: getModCommandsMarkdown(),
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
  LEADERBOARD_START,
  LEADERBOARD_END,
  WARNING_UPDATE_END: () =>
    `[NOTE] The previous end date was cleared because it was earlier than the new start date. Add a new end date with \`@LeagueBot end <teamSize> <date>\`.`,
  REACT_TO_RESET,
  MATCH_NOT_VOIDED,
  MATCH_VOIDED,
  REACT_TO_VOID,
  REACT_TO_STAY_QUEUED: ({ teamSize, userIds }) =>
    `Still queueing for ${teamSize}s, ${usersToString(
      userIds
    )}? React with any emoji to stay in the queue.`,
  REMOVED_FROM_QUEUE: ({ teamSize, userIds }) => {
    const verb = userIds.length > 1 ? 'have' : 'has'

    return `${usersToString(
      userIds
    )} ${verb} been removed from the ${teamSize}s queue.`
  },
}
