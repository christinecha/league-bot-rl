const { league2s } = require('../test/league');
const leagues = require('./data/leagues')
const createMatch = require('./createMatch');

beforeEach(async (done) => {
  await leagues.create(league2s)
  done()
})

afterEach(async (done) => {
  await leagues.delete(league2s.id)
  done()
});

test('create a 2s match', async (done) => {
  const match = await createMatch(league2s.id)

  const allPlayers = {}
  Object.keys(match.team1).forEach(key => allPlayers[key] = true)
  Object.keys(match.team2).forEach(key => allPlayers[key] = true)

  // All teams have enough players
  expect(Object.keys(match.team1).length).toBe(2)
  expect(Object.keys(match.team2).length).toBe(2)

  // All players are unique
  expect(Object.keys(allPlayers).length).toBe(4)

  // Team size is correct
  expect(match.teamSize).toBe(2)
  done()
})