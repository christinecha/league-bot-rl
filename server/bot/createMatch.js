const matches = require('../data/matches')
const leagues = require('../data/leagues')
const ERRORS = require('../constants/ERRORS')
const { generateMatchId } = require('../data/matchId')
const { getLeagueStats } = require('../util/getLeagueStats')
const { getGuildUser } = require('../util/getGuildUser')
const { getTeamCombos } = require('../util/getTeamCombos')
const { balanceTeams } = require('../util/balanceTeams')

const MATCH_MODE = {
  RANDOM: 'random',
  AUTO: 'auto',
}

const createMatch = async ({
  leagueId,
  playerIds,
  mode = MATCH_MODE.AUTO,
  teamSize,
}) => {
  const queue = playerIds.slice()
  const players = {}
  const guildId = leagueId.split('-')[0]

  try {
    if (mode === MATCH_MODE.RANDOM) {
      const teamCombos = getTeamCombos(teamSize)
      let rand = 0

      if (teamCombos.length > 1) {
        const { lastCombo } = await leagues.get(leagueId)
        if (lastCombo !== undefined) teamCombos.splice(lastCombo, 1)
        rand = Math.floor(Math.random() * teamCombos.length)
        await leagues.update({ id: leagueId, lastCombo: rand })
      }

      const order = teamCombos[rand]

      order.forEach((team, i) => {
        players[playerIds[i]] = { team }
      })
    }

    if (mode === MATCH_MODE.AUTO) {
      const stats = await getLeagueStats(leagueId)
      const users = await Promise.all(
        queue.map(id => getGuildUser({ userId: id, guildId }))
      )

      const teams = balanceTeams(
        users.map(u => ({
          id: u.id,
          ratio: stats[u.id] ? stats[u.id].ratio : 0.5,
          rank: u.rank,
        }))
      )

      teams[1].forEach(p => (players[p.id] = { team: 1 }))
      teams[2].forEach(p => (players[p.id] = { team: 2 }))
    }

    const matchId = await generateMatchId({ leagueId })

    return await matches.create({
      id: matchId,
      league: leagueId,
      teamSize,
      players,
      mode,
    })
  } catch (err) {
    console.log('[ERROR]', err)
    throw ERRORS.MATCH_CREATION_ERROR
  }
}

module.exports = createMatch
