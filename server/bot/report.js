const matches = require('../data/matches')
const { formMatchId } = require('../data/matchId')
const ERRORS = require('./constants/ERRORS')

const getWinner = (match, userId, didWin) => {
  const { team } = match.players[userId]
  if (didWin) return team
  return team === 1 ? 2 : 1
}

const report = async ({ matchKey, userId, guildId, didWin }) => {
  const matchId = formMatchId({ guildId, matchKey })
  const match = await matches.get(matchId)
  if (!match) throw (ERRORS.MATCH_INVALID)

  const players = match.players || {}

  if (!players[userId]) throw (ERRORS.MATCH_NO_SUCH_USER)
  if (match.winner) throw (ERRORS.MATCH_DUPLICATE_REPORT)

  const winner = getWinner(match, userId, didWin)
  return await matches.update({ id: matchId, winner })
}

const onReport = async (matchKey, didWin, context) => {
  const userId = context.author.id
  let match

  try {
    match = await report({ matchKey, userId, guildId: context.guild.id, didWin })
  } catch (err) {
    console.log(err)
    if (err) context.channel.send(err)
    return
  }

  context.channel.send(`Team ${match.winner} won Match #${matchKey}!`)
}

const onReportWin = async (matchKey, context) => {
  return onReport(matchKey, true, context)
}

const onReportLoss = async (matchKey, context) => {
  return onReport(matchKey, false, context)
}

module.exports = {
  onReportWin,
  onReportLoss
}