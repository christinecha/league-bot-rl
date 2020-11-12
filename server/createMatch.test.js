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

  const team1 = Object.values(match.players).filter(p => p.team === 1)
  const team2 = Object.values(match.players).filter(p => p.team === 2)

  // All players are unique
  expect(Object.keys(match.players).length).toBe(4)

  // All teams have enough players
  expect(team1.length).toBe(2)
  expect(team2.length).toBe(2)

  // Team size is correct
  expect(match.teamSize).toBe(2)
  done()
})