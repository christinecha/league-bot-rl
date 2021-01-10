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
const { LEADERBOARD_START, LEADERBOARD_END } = require('./messages')
const BOT_ID = process.env.BOT_ID

const getDateStamp = (d) => new Date(`${d} 00:00:00 GMT-0500`).getTime()

const DATES = {
  JAN_1: '2020-01-01',
  JAN_15: '2020-01-15',
  JAN_16: '2020-01-16',
  JAN_31: '2020-01-31',
}

beforeAll(async (done) => {
  await cleanDatabase()
  done()
})

beforeEach(async (done) => {
  const _now = Date.now.bind(global.Date)
  await leagues.create(league2s)

  global.Date.now = jest.fn(() => getDateStamp(DATES.JAN_1))
  await matches.create({ ...match2s, id: `${league2s.id}-1`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-2`, winner: 2 })

  global.Date.now = jest.fn(() => getDateStamp(DATES.JAN_15))
  await matches.create({ ...match2s, id: `${league2s.id}-3`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-4`, winner: 2 })

  global.Date.now = jest.fn(() => getDateStamp(DATES.JAN_31))
  await matches.create({ ...match2s, id: `${league2s.id}-5`, winner: 2 })

  global.Date.now = _now
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('@LeagueBot start <teamSize> <date>', async (done) => {
  const originalStats = await getLeagueStats(league2s.id)
  let stats

  // League range cannot be updated by a non-admin.
  const msg = await triggerMessage({
    userId: plebUser.id,
    content: `<@!${BOT_ID}> start 2s ${DATES.JAN_1}`,
  })
  const { send } = msg.channel
  expect(send).toHaveBeenCalledWith(ERRORS.MOD_ONLY)
  stats = await getLeagueStats(league2s.id)
  expect(stats).toStrictEqual(originalStats)

  // League range should not be updated if the date is invalid.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> start 2s blahblah`,
  })
  expect(send).toHaveBeenCalledWith(ERRORS.DATE_INVALID)
  stats = await getLeagueStats(league2s.id)
  expect(stats).toStrictEqual(originalStats)

  // League range should not be updated if the team size is invalid or missing.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> start 44 blahblah`,
  })
  expect(send).toHaveBeenCalledWith(ERRORS.INVALID_TEAM_SIZE)
  stats = await getLeagueStats(league2s.id)
  expect(stats).toStrictEqual(originalStats)

  // League start should be updated if everything is valid!
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> start 2s ${DATES.JAN_15}`,
  })

  expect(send).toHaveBeenCalledWith(
    LEADERBOARD_START({
      teamSize: 2,
      date: 'Jan 15, 2020, 12:00 AM GMT-5',
    })
  )
  const newStats = await getLeagueStats(league2s.id)
  expect(newStats).not.toStrictEqual(originalStats)
  expect(newStats).toMatchSnapshot()

  // League end should not be updated if it is earlier than the start.
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> end 2s ${DATES.JAN_1}`,
  })
  stats = await getLeagueStats(league2s.id)
  expect(send).toHaveBeenCalledWith(ERRORS.END_MUST_BE_AFTER_START)
  expect(stats).toStrictEqual(newStats)

  // League end should be updated!
  await triggerMessage({
    userId: adminUser.id,
    content: `<@!${BOT_ID}> end 2s ${DATES.JAN_16}`,
  })

  expect(send).toHaveBeenCalledWith(
    LEADERBOARD_END({
      teamSize: 2,
      date: 'Jan 16, 2020, 12:00 AM GMT-5',
    })
  )
  stats = await getLeagueStats(league2s.id)
  expect(stats).not.toStrictEqual(newStats)
  expect(stats).toMatchSnapshot()

  // Database should have correct range values
  const league = await leagues.get(league2s.id)
  expect(league.rangeStart).toBe(1579064400000)
  expect(league.rangeEnd).toBe(1579150800000)

  done()
})
