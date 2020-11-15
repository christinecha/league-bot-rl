const { db } = require('./util/firebase')

const generateMatchId = async ({ leagueId }) => {
  let matchCount

  await db.runTransaction(async (t) => {
    const leagueRef = db.collection('leagues').doc(leagueId)
    const league = await t.get(leagueRef)
    const _matchCount = league.data().matchCount
    matchCount = Number.isNaN(_matchCount) ? 1 : _matchCount + 1
    t.update(leagueRef, { matchCount })
  })

  return `${leagueId}-${matchCount}`
}

const parseMatchId = (matchId) => {
  const parts = matchId.split('-')
  return {
    full: matchId,
    guildId: parts[0],
    teamSize: parseInt(parts[1]),
    key: `${parts[1]}${parts[2]}`
  }
}

const formMatchId = ({ guildId, matchKey }) => {
  const teamSize = matchKey[0]
  const matchNum = matchKey.substr(1)
  return `${guildId}-${teamSize}-${matchNum}`
}

module.exports = { generateMatchId, parseMatchId, formMatchId }