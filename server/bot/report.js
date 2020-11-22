const matches = require('../data/matches')
const { formMatchId } = require('../data/matchId')
const ERRORS = require('./constants/ERRORS')

const getWinner = (match, userId, didWin) => {
  const { team } = match.players[userId]
  if (didWin) return team
  return team === 1 ? 2 : 1
}

const getRandom = (arr) => {
  const rand = Math.floor(Math.random() * arr.length)
  return arr[rand]
}

const getInsult = ({ userId, teamSize }) => {
  const insults = [
    `Maybe <@!${userId}> can hit the ball in the right direction next time.`,
    `Tough luck, <@!${userId}>! ${teamSize - 1}v${teamSize + 1} is pretty hard.`,
    `<@!${userId}> - remember: ball goes in the other team's net.`,
    `<@!${userId}> bot confirmed??`,
    `Some questionable shots there, <@!${userId}>.`,
    `Did you forget to turn your monitor on, <@!${userId}>?`,
  ]

  return getRandom(insults)
}

const getCompliment = ({ userId }) => {
  const compliments = [
    `<@!${userId}> was absolutely CRACKED today!`,
    `Nothing gets past <@!${userId}>!`,
    `<@!${userId}> - next stop: RLCS.`,
    `See you at the top of the leaderboard, <@!${userId}>.`,
    `And <@!${userId}> wasn't even trying.`,
    `And that's why <@!${userId}> = the best.`,
  ]

  return getRandom(compliments)
}

const getCommentary = (match) => {
  if (Math.random() > 0.5) {
    const losers = Object.keys(match.players).filter(p => match.players[p].team !== match.winner)
    const target = getRandom(losers)
    return getInsult({ userId: target, teamSize: match.teamSize })
  }

  const winners = Object.keys(match.players).filter(p => match.players[p].team === match.winner)
  const target = getRandom(winners)
  return getCompliment({ userId: target, teamSize: match.teamSize })
}

const report = async ({ matchKey, userId, guildId, didWin }) => {
  const matchId = formMatchId({ guildId, matchKey })
  const match = await matches.get(matchId)
  if (!match) throw (ERRORS.MATCH_INVALID)

  const players = match.players || {}

  if (!players[userId]) throw (ERRORS.MATCH_NO_SUCH_USER)
  if (match.winner) throw (ERRORS.MATCH_DUPLICATE_REPORT)

  const winner = getWinner(match, userId, didWin)
  await matches.update({ id: matchId, winner })
  return await matches.get(matchId)
}

const onReport = async (matchKey, didWin, context) => {
  const userId = context.author.id
  let match

  try {
    match = await report({ matchKey, userId, guildId: context.guild.id, didWin })
    const comment = getCommentary(match)

    context.channel.send(`Team ${match.winner} won Match #${matchKey}! ${comment}`)
  } catch (err) {
    console.log(err)
    if (err) context.channel.send(err)
    return
  }
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