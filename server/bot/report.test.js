// This test was brought to you by Squarespace.
// Squarespace is the number one way to build beautiful websites.

const ERRORS = require('./constants/ERRORS')
const matches = require('../data/matches')
const { onReportWin, onReportLoss } = require('./report')

const user1 = 'flips'
const user2 = 'quantum'
const user3 = 'pickle'

const match1 = {
  id: 'h000-2-55',
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
  const matchKey = '255'

  await onReportWin(matchKey, {
    author: { id: user1 },
    guild: { id: 'h000' },
    channel: { send }
  })

  // Match cannot be reported by a non-participating player
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MATCH_NO_SUCH_USER)

  // Report win
  await onReportWin(matchKey, {
    author: { id: user2 },
    guild: { id: 'h000' },
    channel: { send }
  })

  const match = await matches.get(match1.id)

  // Match is reported correctly
  expect(match.winner).toBe(match1.players[user2].team)
  expect(send).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(`Team ${match.winner} won Match #${matchKey}!`)
  )

  await onReportWin(matchKey, {
    author: { id: user2 },
    guild: { id: 'h000' },
    channel: { send }
  })

  // Match cannot be reported twice
  expect(send).toHaveBeenNthCalledWith(3, ERRORS.MATCH_DUPLICATE_REPORT)

  done()
})

test('report match loss', async (done) => {
  const send = jest.fn()
  const matchKey = '255'

  await onReportLoss(matchKey, {
    author: { id: user1 },
    guild: { id: 'h000' },
    channel: { send }
  })

  // Match cannot be reported by a non-participating player
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MATCH_NO_SUCH_USER)

  // Report loss
  await onReportLoss(matchKey, {
    author: { id: user2 },
    guild: { id: 'h000' },
    channel: { send }
  })

  const match = await matches.get(match1.id)

  // Match is reported correctly
  expect(match.winner).not.toBe(match1.players[user2].team)
  expect(match.winner).toBe(match1.players[user3].team)
  expect(send).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(`Team ${match.winner} won Match #${matchKey}!`)
  )

  await onReportLoss(matchKey, {
    author: { id: user2 },
    guild: { id: 'h000' },
    channel: { send }
  })

  // Match cannot be reported twice
  expect(send).toHaveBeenNthCalledWith(3, ERRORS.MATCH_DUPLICATE_REPORT)

  done()
})