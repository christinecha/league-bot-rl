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

beforeAll(async () => {
  await cleanDatabase()
})

beforeEach(async () => {
  await matches.create(match2s)
})

afterEach(async () => {
  await cleanDatabase()
})

test('@LeagueBot void <matchId>', async () => {
  const matchKey = parseMatchId(match2s.id).key

  const msg = await triggerMessage({
    userId: plebUser.id,
    content: `<@!${BOT_ID}> void ${matchKey}`,
  })
  const { send } = msg.channel
  expect(send).toHaveBeenNthCalledWith(1, expect.objectContaining({
    content: ERRORS.MOD_ONLY
  }))

  // Match should not be voided if there's no confirmation.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> void ${matchKey}`,
  })
  expect(send).toHaveBeenNthCalledWith(2, expect.objectContaining({
    content: REACT_TO_VOID(matchKey)
  }))
  expect(send).toHaveBeenNthCalledWith(3, expect.objectContaining({
    content: MATCH_NOT_VOIDED(matchKey)
  }))

  // Admins can void a match if confirmed.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> void ${matchKey}`,
    reactions: [[{ emoji: { name: '✅' } }, adminUser]],
  })
  expect(send).toHaveBeenNthCalledWith(4, expect.objectContaining({
    content: REACT_TO_VOID(matchKey)
  }))
  expect(send).toHaveBeenNthCalledWith(5, expect.objectContaining({
    content: MATCH_VOIDED(matchKey)
  }))

  const match = await matches.get(match2s.id)
  expect(match).toBeFalsy()
})
