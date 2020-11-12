const { match2s } = require('../test/match')
const ERRORS = require('./constants/ERRORS')
const matches = require('./data/matches')
const { report, getWinner } = require('./report')

beforeEach(async (done) => {
  await matches.create(match2s)
  done()
})

afterEach(async (done) => {
  await matches.delete(match2s.id)
  done()
});

test('report 2s match win', async (done) => {
  const playerId = Object.keys(match2s.players)[0]

  // Match cannot be reported by a non-participating player
  expect(report(match2s.id, 'rando-player', true)).rejects.toEqual(ERRORS.MATCH_NO_SUCH_USER)

  const match = await report(match2s.id, playerId, true)

  // Match is reported correctly
  expect(match.winner).toBe(match2s.players[playerId].team)

  // Match cannot be reported twice
  expect(report(match2s.id, playerId, true)).rejects.toEqual(ERRORS.MATCH_DUPLICATE_REPORT)
  done()
})

test('get correct winner', () => {
  const mockMatch = {
    players: {
      'hoody': { team: 1 },
      'woody': { team: 2 },
      'doody': { team: 1 },
      'goody': { team: 2 },
    }
  }

  expect(getWinner(mockMatch, 'hoody', true)).toBe(1)
  expect(getWinner(mockMatch, 'hoody', false)).toBe(2)
})