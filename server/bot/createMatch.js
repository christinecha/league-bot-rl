const matches = require('../data/matches')
const ERRORS = require('./constants/ERRORS')
const { generateMatchId } = require('../data/matchId')

const createMatch = async ({ leagueId, playerIds, mode, teamSize }) => {
  const queue = playerIds.slice()
  const players = {}

  for (let i = 0; i < teamSize * 2; i++) {
    const rand = Math.floor(Math.random() * queue.length)
    const player = queue.splice(rand, 1)
    const team = i % 2 === 0 ? 1 : 2
    players[player] = { team }
  }

  try {
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