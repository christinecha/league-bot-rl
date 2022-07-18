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

beforeAll(async () => {
  await cleanDatabase()
})

beforeEach(async () => {
  await matches.create({ ...match2s, winner: 1 })
})

afterEach(async () => {
  await cleanDatabase()
})

test('@LeagueBot fix <matchId>', async () => {
  const matchKey = parseMatchId(match2s.id).key

  // Non-admin cannot do this.
  const msg = await triggerMessage({
    userId: plebUser.id,
    content: `<@!${BOT_ID}> fix ${matchKey}`,
  })
  const { send } = msg.channel
  expect(send).toHaveBeenNthCalledWith(1, expect.objectContaining({ content: ERRORS.MOD_ONLY }))

  // Match should not be changed if there's no selection.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> fix ${matchKey}`,
  })
  expect(send).toHaveBeenNthCalledWith(2, expect.objectContaining({ content: REACT_TO_OVERWRITE() }))
  expect(send).toHaveBeenNthCalledWith(3, expectMatchMessage(match2s))
  expect(send).toHaveBeenNthCalledWith(4, expect.objectContaining({ content: ERRORS.NO_TEAM_SELECTED }))

  match = await matches.get(match2s.id)
  expect(match.winner).toBe(1)

  // Admins can overwrite a match if they select a team.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> fix ${matchKey}`,
    reactions: [[{ emoji: { name: '2️⃣' } }, adminUser]],
  })
  expect(send).toHaveBeenNthCalledWith(5, expect.objectContaining({ content: REACT_TO_OVERWRITE() }))
  expect(send).toHaveBeenNthCalledWith(6, expectMatchMessage(match2s))
  expect(send).toHaveBeenNthCalledWith(7, expect.objectContaining({ content: TEAM_WON({ winner: 2, matchKey }) }))

  let match = await matches.get(match2s.id)
  expect(match.winner).toBe(2)
})
