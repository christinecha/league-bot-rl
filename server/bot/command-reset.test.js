// Start mock server!
require('./index')
const leagues = require('../data/leagues')
const matches = require('../data/matches')
const { getLeagueStats } = require('../util/getLeagueStats')
const { cleanDatabase, triggerMessage } = require('../test/util')
const ERRORS = require('../constants/ERRORS')
const { match2s } = require('../test/match')
const { league2s } = require('../test/league')
const { plebUser, adminUser } = require('../test/users')
const {
  LEADERBOARD_RESET,
  LEADERBOARD_NOT_RESET,
  REACT_TO_RESET,
} = require('./messages')
const BOT_ID = process.env.BOT_ID

beforeAll(async (done) => {
  await cleanDatabase()
  done()
})

beforeEach(async (done) => {
  await leagues.create(league2s)
  await matches.create({ ...match2s, id: `${league2s.id}-1`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-2`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-3`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-4`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-5`, winner: 2 })
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('@LeagueBot reset <teamSize>', async (done) => {
  const originalStats = await getLeagueStats(league2s.id)
  let stats

  // League cannot be reset by a non-admin.
  const msg = await triggerMessage({
    userId: plebUser.id,
    content: `<@!${BOT_ID}> reset 2`,
  })
  const { send } = msg.channel
  expect(send).toHaveBeenCalledWith(ERRORS.MOD_ONLY)
  stats = await getLeagueStats(league2s.id)
  expect(stats).toStrictEqual(originalStats)

  // League should not be reset if there's no confirmation.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> reset 2`,
  })
  expect(send).toHaveBeenCalledWith(REACT_TO_RESET(2))
  expect(send).toHaveBeenCalledWith(LEADERBOARD_NOT_RESET(2))
  stats = await getLeagueStats(league2s.id)
  expect(stats).toStrictEqual(originalStats)

  // League should be reset if confirmed.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> reset 2`,
    reactions: [[{ emoji: { name: '✅' } }, adminUser]],
  })
  expect(send).toHaveBeenCalledWith(REACT_TO_RESET(2))
  expect(send).toHaveBeenCalledWith(LEADERBOARD_RESET(2))

  stats = await getLeagueStats(league2s.id)
  expect(stats).toStrictEqual({})

  done()
})
