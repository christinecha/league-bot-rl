const parse = require('date-fns/parse')
const ERRORS = require('../constants/ERRORS')
const leagues = require('../data/leagues')
const { getTeamSize, getLeagueId } = require('../util')

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://www.leaguebotrl.com'
    : 'http://localhost:4242'

const onLeaderboard = async (context, str) => {
  let teamSize

  try {
    teamSize = getTeamSize(str)
  } catch (e) {}

  await context.channel.send(
    `${BASE_URL}/?guildId=${context.guild.id}${
      teamSize ? `&teamSize=${teamSize}` : ''
    }`
  )
}

const parseArgs = (str1, str2) => {
  const teamSize = getTeamSize(str1)

  if (!str2) {
    throw ERRORS.DATE_MISSING
  }

  const date = parse(str2, 'yyyy-mm-dd', Date.now())
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) {
    throw ERRORS.DATE_INVALID
  }

  return { teamSize, timestamp }
}

const onLeaderboardStart = async (context, str1, str2) => {
  try {
    const { teamSize, timestamp } = parseArgs(str1, str2)
    const leagueId = getLeagueId(teamSize, context)

    await leagues.update({
      id: leagueId,
      rangeStart: timestamp,
    })
  } catch (err) {
    await context.channel.send(err)
  }
}

const onLeaderboardEnd = async (context, str1, str2) => {
  try {
    const { teamSize, timestamp } = parseArgs(str1, str2)
    const leagueId = getLeagueId(teamSize, context)

    await leagues.update({
      id: leagueId,
      rangeEnd: timestamp,
    })
  } catch (err) {
    await context.channel.send(err)
  }
}

module.exports = { onLeaderboard, onLeaderboardStart, onLeaderboardEnd }
