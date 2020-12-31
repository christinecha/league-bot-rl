const { balanceTeams } = require('./balanceTeams')
const leagues = require('../data/leagues')
const { cleanDatabase } = require('../test/util')
const { getLeagueStats } = require('../util/getLeagueStats')
const { league2s, league3s, league4s } = require('../test/league')
const {
  bronzeUser,
  platUser,
  diamondUser,
  champUser,
  silverUser,
  goldUser,
  gcUser,
  sslUser,
} = require('../test/users')

jest.mock('../util/getLeagueStats')
getLeagueStats.mockResolvedValue({})

beforeAll(async (done) => {
  await cleanDatabase()
  done()
})

beforeEach(async (done) => {
  await leagues.create(league2s)
  await leagues.create(league3s)
  await leagues.create(league4s)
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('balanceTeams - by rank', async (done) => {
  let teams

  teams = await balanceTeams({
    leagueId: league2s.id,
    userIds: [bronzeUser.id, platUser.id, diamondUser.id, champUser.id],
  })

  expect(teams).toMatchInlineSnapshot(`
    Object {
      "1": Array [
        "racoon",
        "rookie-bot",
      ],
      "2": Array [
        "flips",
        "suhan",
      ],
    }
  `)

  teams = await balanceTeams({
    leagueId: league3s.id,
    userIds: [
      bronzeUser.id,
      silverUser.id,
      goldUser.id,
      platUser.id,
      diamondUser.id,
      champUser.id,
    ],
  })

  expect(teams).toMatchInlineSnapshot(`
    Object {
      "1": Array [
        "racoon",
        "rookie-bot",
        "suhan",
      ],
      "2": Array [
        "allstar-bot",
        "cha",
        "flips",
      ],
    }
  `)

  teams = await balanceTeams({
    leagueId: league4s.id,
    userIds: [
      bronzeUser.id,
      silverUser.id,
      goldUser.id,
      platUser.id,
      diamondUser.id,
      champUser.id,
      gcUser.id,
      sslUser.id,
    ],
  })

  expect(teams).toMatchInlineSnapshot(`
    Object {
      "1": Array [
        "cha",
        "leth",
        "racoon",
        "rookie-bot",
      ],
      "2": Array [
        "allstar-bot",
        "flips",
        "hoody",
        "suhan",
      ],
    }
  `)

  done()
})

test('balanceTeams - by rank & ratio', async (done) => {
  let teams
  getLeagueStats.mockResolvedValue({
    [goldUser.id]: { ratio: 0.5 },
    [platUser.id]: { ratio: 0.7 },
    [diamondUser.id]: { ratio: 0.4 },
    [champUser.id]: { ratio: 0.5 },
  })

  teams = await balanceTeams({
    leagueId: league2s.id,
    userIds: [goldUser.id, platUser.id, diamondUser.id, champUser.id],
  })

  expect(teams).toMatchInlineSnapshot(`
    Object {
      "1": Array [
        "cha",
        "racoon",
      ],
      "2": Array [
        "flips",
        "suhan",
      ],
    }
  `)
  done()
})
