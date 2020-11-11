const leagues = require('./data/leagues')
const matches = require('./data/matches')
const { admin } = require('./data/util/firebase')
const FieldValue = admin.firestore.FieldValue

const createMatch = async (leagueId) => {
  const league = await leagues.get(leagueId)
  const { queue, teamSize } = league

  const allPlayers = Object.keys(queue).sort((a, b) => queue[a] - queue[b])
  const players = allPlayers.slice(0, teamSize * 2)

  const queueUpdates = {}
  players.forEach(id => queueUpdates[`queue.${id}`] = FieldValue.delete())
  await leagues.update({ id: league.id, ...queueUpdates })

  const team1 = {}
  const team2 = {}

  for (let i = 0; i < teamSize * 2; i++) {
    const rand = Math.floor(Math.random() * players.length)
    const player = players.splice(rand, 1)
    const team = i % 2 === 0 ? team1 : team2
    team[player] = true
  }

  return await matches.create({
    teamSize,
    team1,
    team2,
  })
}

module.exports = createMatch