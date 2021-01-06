const dateFns = require('date-fns')
const ERRORS = require('../constants/ERRORS')
const leagues = require('../data/leagues')
const { getTeamSize, getLeagueId } = require('../util')
const {
  LEADERBOARD_START,
  LEADERBOARD_END,
  WARNING_UPDATE_END,
} = require('./messages')

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

  const date = dateFns.parse(str2, 'yyyy-mm-dd', Date.now())
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)

  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) {
    throw ERRORS.DATE_INVALID
  }

  return { teamSize, timestamp, date: dateFns.format(date, 'PPp O') }
}

const onLeaderboardStart = async (context, str1, str2) => {
  try {
    const { teamSize, timestamp, date } = parseArgs(str1, str2)
    const leagueId = getLeagueId(teamSize, context)
    const league = await leagues.get(leagueId)

    const clearEnd = league.rangeEnd && league.rangeEnd <= timestamp

    await leagues.update({
      id: leagueId,
      rangeStart: timestamp,
      ...(clearEnd ? { rangeEnd: null } : {}),
    })

    await context.channel.send(LEADERBOARD_START({ teamSize, date }))

    if (clearEnd) {
      await context.channel.send(WARNING_UPDATE_END())
    }
  } catch (err) {
    await context.channel.send(err)
  }
}

const onLeaderboardEnd = async (context, str1, str2) => {
  try {
    const { teamSize, timestamp, date } = parseArgs(str1, str2)
    const leagueId = getLeagueId(teamSize, context)
    const league = await leagues.get(leagueId)

    if (league.rangeStart && league.rangeStart >= timestamp) {
      throw ERRORS.END_MUST_BE_AFTER_START
    }

    await leagues.update({
      id: leagueId,
      rangeEnd: timestamp,
    })

    await context.channel.send(LEADERBOARD_END({ teamSize, date }))
  } catch (err) {
    await context.channel.send(err)
  }
}

module.exports = { onLeaderboard, onLeaderboardStart, onLeaderboardEnd }
