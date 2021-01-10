// Start mock server!
require('./index')
const matches = require('../data/matches')
const { parseMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')
const { match2s } = require('../test/match')
const { expectMatchMessage } = require('../test/messages')
const { cleanDatabase, triggerMessage } = require('../test/util')
const { adminUser, plebUser } = require('../test/users')
const { TEAM_WON, REACT_TO_OVERWRITE } = require('./messages')
const BOT_ID = process.env.BOT_ID

beforeAll(async (done) => {
  await cleanDatabase()
  done()
})

beforeEach(async (done) => {
  await matches.create({ ...match2s, winner: 1 })
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('@LeagueBot fix <matchId>', async (done) => {
  const matchKey = parseMatchId(match2s.id).key

  // Non-admin cannot do this.
  const msg = await triggerMessage({
    userId: plebUser.id,
    content: `<@!${BOT_ID}> fix ${matchKey}`,
  })
  const { send } = msg.channel
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MOD_ONLY)

  // Match should not be changed if there's no selection.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> fix ${matchKey}`,
  })
  expect(send).toHaveBeenNthCalledWith(2, REACT_TO_OVERWRITE())
  expect(send).toHaveBeenNthCalledWith(3, expectMatchMessage(match2s))
  expect(send).toHaveBeenNthCalledWith(4, ERRORS.NO_TEAM_SELECTED)

  match = await matches.get(match2s.id)
  expect(match.winner).toBe(1)

  // Admins can overwrite a match if they select a team.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> fix ${matchKey}`,
    reactions: [[{ _emoji: { name: '2️⃣' } }, adminUser]],
  })
  expect(send).toHaveBeenNthCalledWith(5, REACT_TO_OVERWRITE())
  expect(send).toHaveBeenNthCalledWith(6, expectMatchMessage(match2s))
  expect(send).toHaveBeenNthCalledWith(7, TEAM_WON({ winner: 2, matchKey }))

  let match = await matches.get(match2s.id)
  expect(match.winner).toBe(2)

  done()
})
