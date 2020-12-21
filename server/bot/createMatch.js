const matches = require('../data/matches')
const leagues = require('../data/leagues')
const ERRORS = require('./constants/ERRORS')
const { generateMatchId } = require('../data/matchId')
const { getLeagueStats } = require('../getLeagueStats')
const { getGuildUser } = require('../getGuildUser')
const { getTeamCombos } = require('./getTeamCombos')

const MATCH_MODE = {
  RANDOM: 'random',
  AUTO: 'auto'
}

const BALANCE = {
  2: { 0: 1, 1: 2, 2: 2, 3: 1 },
  3: { 0: 1, 1: 2, 2: 1, 3: 2, 4: 2, 5: 1 },
}

const createMatch = async ({ leagueId, playerIds, mode = MATCH_MODE.AUTO, teamSize }) => {
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
        queue.map((id) => getGuildUser({ userId: id, guildId }))
      )

      const score = user => {
        const ratio = stats[user.id] ? stats[user.id].ratio : 0.5
        if (!user.rank) return ratio
        return (user.rank / 13) + ratio
      }

      const ordered = users.sort((a, b) => {
        return score(a) > score(b) ? 1 : -1
      })

      ordered.forEach((user, i) => {
        players[user.id] = { team: BALANCE[teamSize][i] }
      })
    }

    const matchId = await generateMatchId({ leagueId })

    return await matches.create({
      id: matchId,
      league: leagueId,
      teamSize,
      players,
      mode
    })
  } catch (err) {
    console.log('[ERROR]', err)
    throw ERRORS.MATCH_CREATION_ERROR
  }
}

module.exports = createMatch