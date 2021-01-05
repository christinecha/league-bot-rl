const parse = require('date-fns/parse')
const ERRORS = require('../constants/ERRORS')
const { getTeamSize } = require('../util')

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

const onLeaderboardStart = async (context, str, otherstr) => {
  if (!str) {
    await context.channel.send(ERRORS.DATE_MISSING)
    return
  }

  const date = parse(str, 'yyyy-mm-dd', Date.now())
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) {
    await context.channel.send(ERRORS.DATE_INVALID)
    return
  }

  console.log('leaderboard start!', date, otherstr)
}

const onLeaderboardEnd = async (context, str) => {
  console.log('leaderboard end!', str)
}

module.exports = { onLeaderboard, onLeaderboardStart, onLeaderboardEnd }
