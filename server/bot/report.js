const matches = require('../data/matches')
const { formMatchId } = require('../data/matchId')
const { getTeams } = require('../util')
const { getInsult, getCompliment } = require('../util/getCommentary')
const ERRORS = require('../constants/ERRORS')

const getWinner = (match, userId, didWin) => {
  const { team } = match.players[userId]
  if (didWin) return team
  return team === 1 ? 2 : 1
}

const getRandom = (arr) => {
  const rand = Math.floor(Math.random() * arr.length)
  return arr[rand]
}

const getCommentary = (match) => {
  const teams = getTeams(match.players)
  const loser = match.winner === 1 ? 2 : 1

  if (Math.random() > 0.5) {
    const target = getRandom(teams[loser])
    return getInsult({ userId: target, teamSize: match.teamSize })
  }

  const target = getRandom(teams[match.winner])
  return getCompliment({ userId: target, teamSize: match.teamSize })
}

const report = async ({ matchKey, userId, guildId, didWin }) => {
  const matchId = formMatchId({ guildId, matchKey })
  const match = await matches.get(matchId)
  if (!match) throw ERRORS.MATCH_INVALID

  const players = match.players || {}

  if (!players[userId]) throw ERRORS.MATCH_NO_SUCH_USER
  if (match.winner) throw ERRORS.MATCH_DUPLICATE_REPORT

  const winner = getWinner(match, userId, didWin)
  await matches.update({ id: matchId, winner })
  return await matches.get(matchId)
}

const onReport = async (context, matchKey, didWin) => {
  if (!matchKey) {
    context.channel.send(ERRORS.MATCH_INVALID)
    return
  }

  const userId = context.author.id
  let match

  try {
    match = await report({
      matchKey,
      userId,
      guildId: context.guild.id,
      didWin,
    })
    const comment = getCommentary(match)

    context.channel.send(
      `Team ${match.winner} won Match #${matchKey}! ${comment}`
    )
  } catch (err) {
    console.log(err)
    if (err) context.channel.send(err)
    return
  }
}

const onReportWin = async (context, matchKey) => {
  return onReport(context, matchKey, true)
}

const onReportLoss = async (context, matchKey) => {
  return onReport(context, matchKey, false)
}

module.exports = {
  onReportWin,
  onReportLoss,
}
