const ERRORS = require('./constants/ERRORS')
const matches = require('../data/matches')
const { onReportWin, onReportLoss } = require('./report')

const user1 = 'flips'
const user2 = 'quantum'
const user3 = 'pickle'

const match1 = {
  id: 'match-1',
  teamSize: 2,
  players: {
    [user2]: { team: 1 },
    [user3]: { team: 2 },
    user4: { team: 1 },
    user5: { team: 2 },
  }
}

beforeEach(async (done) => {
  await matches.create(match1)
  done()
})

afterEach(async (done) => {
  await matches.delete(match1.id)
  done()
});

test('report match win', async (done) => {
  const send = jest.fn()

  await onReportWin(match1.id, {
    author: { id: user1 },
    guild: { id: 'hooo-crew' },
    channel: { send }
  })

  // Match cannot be reported by a non-participating player
  expect(send).toHaveBeenCalledWith(ERRORS.MATCH_NO_SUCH_USER)

  // Report win
  await onReportWin(match1.id, {
    author: { id: user2 },
    guild: { id: 'hooo-crew' },
    channel: { send }
  })

  const match = await matches.get(match1.id)

  // Match is reported correctly
  expect(match.winner).toBe(match1.players[user2].team)

  await onReportWin(match1.id, {
    author: { id: user2 },
    guild: { id: 'hooo-crew' },
    channel: { send }
  })

  // Match cannot be reported twice
  expect(send).toHaveBeenCalledWith(ERRORS.MATCH_DUPLICATE_REPORT)

  done()
})

test('report match loss', async (done) => {
  const send = jest.fn()

  await onReportLoss(match1.id, {
    author: { id: user1 },
    guild: { id: 'hooo-crew' },
    channel: { send }
  })

  // Match cannot be reported by a non-participating player
  expect(send).toHaveBeenCalledWith(ERRORS.MATCH_NO_SUCH_USER)

  // Report win
  await onReportLoss(match1.id, {
    author: { id: user2 },
    guild: { id: 'hooo-crew' },
    channel: { send }
  })

  const match = await matches.get(match1.id)

  // Match is reported correctly
  expect(match.winner).not.toBe(match1.players[user2].team)
  expect(match.winner).toBe(match1.players[user3].team)

  await onReportLoss(match1.id, {
    author: { id: user2 },
    guild: { id: 'hooo-crew' },
    channel: { send }
  })

  // Match cannot be reported twice
  expect(send).toHaveBeenCalledWith(ERRORS.MATCH_DUPLICATE_REPORT)

  done()
})