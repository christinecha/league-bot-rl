// Start mock server!
require('./index')
const matches = require('../data/matches')
const { parseMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')
const { match2s } = require('../test/match')
const { plebUser, adminUser } = require('../test/users')
const { cleanDatabase, triggerMessage } = require('../test/util')
const {
  REACT_TO_RESET,
  REACT_TO_VOID,
  MATCH_NOT_VOIDED,
  MATCH_VOIDED,
} = require('./messages')
const BOT_ID = process.env.BOT_ID

beforeAll(async (done) => {
  await cleanDatabase()
  done()
})

beforeEach(async (done) => {
  await matches.create(match2s)
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('@LeagueBot void <matchId>', async (done) => {
  const matchKey = parseMatchId(match2s.id).key

  const msg = await triggerMessage({
    userId: plebUser.id,
    content: `<@!${BOT_ID}> void ${matchKey}`,
  })
  const { send } = msg.channel
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MOD_ONLY)

  // Match should not be voided if there's no confirmation.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> void ${matchKey}`,
  })
  expect(send).toHaveBeenNthCalledWith(2, REACT_TO_VOID(matchKey))
  expect(send).toHaveBeenNthCalledWith(3, MATCH_NOT_VOIDED(matchKey))

  // Admins can void a match if confirmed.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> void ${matchKey}`,
    reactions: [[{ emoji: { name: '✅' } }, adminUser]],
  })
  expect(send).toHaveBeenNthCalledWith(4, REACT_TO_VOID(matchKey))
  expect(send).toHaveBeenNthCalledWith(5, MATCH_VOIDED(matchKey))

  const match = await matches.get(match2s.id)
  expect(match).toBeFalsy()

  done()
})
