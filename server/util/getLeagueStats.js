const _matches = require('../data/matches')
const leagues = require('../data/leagues')

const getLeagueStats = async (leagueId) => {
  const league = await leagues.get(leagueId)
  const matches = await _matches.search({
    rules: [
      ['league', '==', leagueId],
      ['timestamp', '>', league.rangeStart || 0],
    ],
  })

  const players = {}

  matches.forEach((m) => {
    Object.keys(m.players).forEach((playerId) => {
      if (!m.winner) return

      players[playerId] = players[playerId] || { win: 0, loss: 0 }

      const didWin = m.winner === m.players[playerId].team
      players[playerId][didWin ? 'win' : 'loss'] += 1
    })
  })

  Object.keys(players).forEach((id) => {
    const { win, loss } = players[id]
    players[id] = {
      id,
      win,
      loss,
      points: win - loss,
      ratio: win / (win + loss),
    }
  })

  return players
}

const getLeagueStatsOrdered = async (leagueId) => {
  const stats = await getLeagueStats(leagueId)

  let place = 1
  const sorted = Object.values(stats).sort((a, b) =>
    a.points < b.points ? 1 : -1
  )

  const placed = sorted.map((player, i) => {
    const prev = sorted[i - 1]
    if (prev && prev.points > player.points) place = i + 1
    return { ...player, place }
  })

  return placed
}

module.exports = {
  getLeagueStats,
  getLeagueStatsOrdered,
}
