const { balanceTeams, scoreUser } = require('./balanceTeams')
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
const RL_RANKS = require('../constants/RL_RANKS')

jest.mock('../util/getLeagueStats')
getLeagueStats.mockResolvedValue({})

beforeAll(async () => {
  await cleanDatabase()
})

beforeEach(async () => {
  await leagues.create(league2s)
  await leagues.create(league3s)
  await leagues.create(league4s)
})

afterEach(async () => {
  await cleanDatabase()
})

test('balanceTeams - by rank', async () => {
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
        "777",
        "racoon",
        "rookie-bot",
      ],
      "2": Array [
        "allstar-bot",
        "flips",
        "suhan",
      ],
    }
  `)

  teams = await balanceTeams({
    leagueId: league3s.id,
    userIds: [
      diamondUser.id,
      diamondUser.id,
      diamondUser.id,
      champUser.id,
      champUser.id,
      gcUser.id,
    ],
  })

  expect(teams[1]).toStrictEqual(
    expect.arrayContaining([gcUser.id, diamondUser.id, diamondUser.id])
  )

  expect(teams[2]).toStrictEqual(
    expect.arrayContaining([champUser.id, champUser.id, diamondUser.id])
  )

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
        "777",
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
})

test('scoreUser', () => {
  const usersOnlyRank = [
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.SSL },
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.GC },
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.Champ },
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.Diamond },
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.Plat },
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.Gold },
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.Silver },
    { win: 2, loss: 2, ratio: 2 / 4, rank: RL_RANKS.Bronze },
  ]

  expect(usersOnlyRank.map(scoreUser)).toMatchInlineSnapshot(`
    Array [
      0.8300000000000001,
      0.665,
      0.54125,
      0.4175,
      0.335,
      0.29375,
      0.2525,
      0.21125000000000002,
    ]
  `)

  const usersAllLosses = [
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.SSL },
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.GC },
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.Champ },
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.Diamond },
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.Plat },
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.Gold },
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.Silver },
    { win: 0, loss: 10, ratio: 0, rank: RL_RANKS.Bronze },
  ]

  expect(usersAllLosses.map(scoreUser)).toMatchInlineSnapshot(`
    Array [
      0.66,
      0.495,
      0.37125,
      0.2475,
      0.165,
      0.12375,
      0.0825,
      0.04125,
    ]
  `)
})

test('balanceTeams - by rank & ratio', async () => {
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
        "777",
        "racoon",
      ],
      "2": Array [
        "flips",
        "suhan",
      ],
    }
  `)
})
