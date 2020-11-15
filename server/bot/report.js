const matches = require('../data/matches')
const ERRORS = require('./constants/ERRORS')

const getWinner = (match, userId, didWin) => {
  const { team } = match.players[userId]
  if (didWin) return team
  return team === 1 ? 2 : 1
}

const report = async (matchId, userId, didWin) => {
  const match = await matches.get(matchId)
  const players = match.players || {}

  if (!players[userId]) throw (ERRORS.MATCH_NO_SUCH_USER)
  if (match.winner) throw (ERRORS.MATCH_DUPLICATE_REPORT)

  const winner = getWinner(match, userId, didWin)
  return await matches.update({ id: matchId, winner })
}

const onReport = async (matchId, didWin, context) => {
  const userId = context.author.id
  const verb = didWin ? 'won' : 'lost'
  let match

  try {
    match = await report(matchId, userId, didWin)
  } catch (err) {
    console.log(err)
    if (err) context.channel.send(err)
    return
  }

  context.channel.send(`Team ${match.winner} ${verb} Match #${matchId}!`)
}

const onReportWin = async (matchId, context) => {
  return onReport(matchId, true, context)
}

const onReportLoss = async (matchId, context) => {
  return onReport(matchId, false, context)
}

module.exports = {
  onReportWin,
  onReportLoss
}