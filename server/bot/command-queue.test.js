// Start mock server!
require('./index')
const leagues = require('../data/leagues')
const matches = require('../data/matches')
const ERRORS = require('../constants/ERRORS')
const { league1s, league2s, league3s } = require('../test/league')
const { getLeagueStats } = require('../util/getLeagueStats')
const { usersToString, getTeams } = require('../util')
const { guild } = require('../test/guild')
const { expectMatchMessage } = require('../test/messages')
const {
  bronzeUser,
  silverUser,
  goldUser,
  platUser,
  diamondUser,
  champUser,
} = require('../test/users')
const { triggerMessage, cleanDatabase } = require('../test/util')
const BOT_ID = process.env.BOT_ID

jest.mock('../util/getLeagueStats')
getLeagueStats.mockResolvedValue({})

const getQueueMessage = (regex) => {
  return expect.objectContaining({
    fields: [
      expect.objectContaining({
        value: expect.stringMatching(regex),
      }),
    ],
  })
}

beforeAll(async (done) => {
  await cleanDatabase()
  done()
})

beforeEach(async (done) => {
  await leagues.create(league1s)
  await leagues.create(league2s)
  await leagues.create(league3s)
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('@LeagueBot queue <league>', async (done) => {
  for (let teamSize of [1, 2, 3]) {
    const before = Date.now()
    const m1 = await triggerMessage({
      userId: goldUser.id,
      content: `<@!${BOT_ID}> queue ${teamSize}s`,
    })
    const after = Date.now()

    const league = await leagues.get(`${guild.id}-${teamSize}`)

    // The correct user is queued, at an accurate time
    expect(Object.keys(league.queue)).toStrictEqual([goldUser.id])
    expect(league.queue[goldUser.id]).toBeLessThanOrEqual(after)
    expect(league.queue[goldUser.id]).toBeGreaterThanOrEqual(before)
    expect(m1.channel.send).toHaveBeenNthCalledWith(
      1,
      getQueueMessage(`<@!${goldUser.id}>`)
    )

    // The same user may not queue again.
    const m2 = await triggerMessage({
      userId: goldUser.id,
      content: `<@!${BOT_ID}> queue ${league.teamSize}s`,
    })

    expect(m2.channel.send).toHaveBeenNthCalledWith(
      1,
      ERRORS.QUEUE_DUPLICATE_USER
    )
  }

  done()
})

test('@LeagueBot queue 1s', async (done) => {
  const matchId = `${league1s.id}-1`

  const m1 = await triggerMessage({
    userId: goldUser.id,
    content: `<@!${BOT_ID}> queue 1s`,
  })
  const m2 = await triggerMessage({
    userId: platUser.id,
    content: `<@!${BOT_ID}> queue 1s`,
  })

  // When a user queues, they should receive a message with the updated list
  expect(m1.channel.send).toHaveBeenNthCalledWith(
    1,
    getQueueMessage(`<@!${goldUser.id}>`)
  )

  // When enough users queue for a match:
  const match = await matches.get(matchId)

  // Match should be created in the database
  expect(match).toStrictEqual(
    expect.objectContaining({
      id: matchId,
      teamSize: 1,
      league: league1s.id,
      mode: 'random',
      players: expect.objectContaining({
        [goldUser.id]: { team: expect.any(Number) },
        [platUser.id]: { team: expect.any(Number) },
      }),
    })
  )

  const players = Object.keys(match.players)
  const teams = getTeams(match.players)

  // Match details are correct
  expect(players.length).toBe(2)
  expect(teams[1].length).toBe(1)
  expect(teams[2].length).toBe(1)
  expect(match.teamSize).toBe(1)

  // Match details should be sent
  expect(m2.channel.send).toHaveBeenNthCalledWith(1, expectMatchMessage(match))

  done()
})

test('@LeagueBot queue 2s', async (done) => {
  const matchId = `${league2s.id}-1`

  const m1 = await triggerMessage({
    userId: goldUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  const m2 = await triggerMessage({
    userId: platUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  const m3 = await triggerMessage({
    userId: diamondUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  const m4 = await triggerMessage({
    userId: champUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  // When a user queues, they should receive a message with the updated list
  expect(m1.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${goldUser.id}>`)
  )
  expect(m2.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${platUser.id}>`)
  )
  expect(m3.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${diamondUser.id}>`)
  )

  // When enough users queue for a match:
  const match = await matches.get(matchId)
  const users = [goldUser.id, platUser.id, diamondUser.id, champUser.id]

  // Match mode voting message should be sent
  expect(m4.channel.send).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: `We've got a 2s match!`,
          value: `${usersToString(users)}

Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.
`,
        }),
      ]),
    })
  )

  // Bot should react with the options first!
  expect(m4.react).toHaveBeenCalledTimes(2)

  // Match should be created in the database, default "auto"
  expect(match).toStrictEqual(
    expect.objectContaining({
      id: matchId,
      teamSize: 2,
      league: league2s.id,
      mode: 'auto',
      players: expect.objectContaining({
        [goldUser.id]: { team: expect.any(Number) },
        [platUser.id]: { team: expect.any(Number) },
        [diamondUser.id]: { team: expect.any(Number) },
        [champUser.id]: { team: expect.any(Number) },
      }),
    })
  )

  const players = Object.keys(match.players).sort()
  const teams = getTeams(match.players)

  // Match details are correct
  expect(players.length).toBe(4)
  expect(teams[1].length).toBe(2)
  expect(teams[2].length).toBe(2)
  expect(match.teamSize).toBe(2)

  // Match details should be sent
  expect(m4.channel.send).toHaveBeenNthCalledWith(2, expectMatchMessage(match))

  done()
})

test('@LeagueBot queue 3s', async (done) => {
  const matchId = `${league3s.id}-1`

  const m1 = await triggerMessage({
    userId: bronzeUser.id,
    content: `<@!${BOT_ID}> queue 3s`,
  })

  const m2 = await triggerMessage({
    userId: silverUser.id,
    content: `<@!${BOT_ID}> queue 3s`,
  })

  const m3 = await triggerMessage({
    userId: goldUser.id,
    content: `<@!${BOT_ID}> queue 3s`,
  })

  const m4 = await triggerMessage({
    userId: platUser.id,
    content: `<@!${BOT_ID}> queue 3s`,
  })

  const m5 = await triggerMessage({
    userId: diamondUser.id,
    content: `<@!${BOT_ID}> queue 3s`,
  })

  const m6 = await triggerMessage({
    userId: champUser.id,
    content: `<@!${BOT_ID}> queue 3s`,
  })

  // When a user queues, they should receive a message with the updated list
  expect(m1.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${bronzeUser.id}>`)
  )
  expect(m2.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${silverUser.id}>`)
  )
  expect(m3.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${goldUser.id}>`)
  )
  expect(m4.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${platUser.id}>`)
  )
  expect(m5.channel.send).toHaveBeenCalledWith(
    getQueueMessage(`<@!${diamondUser.id}>`)
  )

  // When enough users queue for a match:
  const match = await matches.get(matchId)
  const users = [
    bronzeUser.id,
    silverUser.id,
    goldUser.id,
    platUser.id,
    diamondUser.id,
    champUser.id,
  ]

  // Match mode voting message should be sent
  expect(m6.channel.send).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: `We've got a 3s match!`,
          value: `${usersToString(users)}

Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.
`,
        }),
      ]),
    })
  )

  // Bot should react with the options first!
  expect(m6.react).toHaveBeenCalledTimes(2)

  // Match should be created in the database, default "auto"
  expect(match).toStrictEqual(
    expect.objectContaining({
      id: matchId,
      teamSize: 3,
      league: league3s.id,
      mode: 'auto',
      players: expect.objectContaining({
        [bronzeUser.id]: { team: expect.any(Number) },
        [silverUser.id]: { team: expect.any(Number) },
        [goldUser.id]: { team: expect.any(Number) },
        [platUser.id]: { team: expect.any(Number) },
        [diamondUser.id]: { team: expect.any(Number) },
        [champUser.id]: { team: expect.any(Number) },
      }),
    })
  )

  const players = Object.keys(match.players).sort()
  const teams = getTeams(match.players)

  // Match details are correct
  expect(players.length).toBe(6)
  expect(teams[1].length).toBe(3)
  expect(teams[2].length).toBe(3)
  expect(match.teamSize).toBe(3)

  // Match details should be sent
  expect(m6.channel.send).toHaveBeenNthCalledWith(2, expectMatchMessage(match))

  done()
})

test('@LeagueBot queue 2s [auto]', async (done) => {
  let matchId = `${league2s.id}-1`

  await triggerMessage({
    userId: goldUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  await triggerMessage({
    userId: platUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  await triggerMessage({
    userId: diamondUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  await triggerMessage({
    userId: champUser.id,
    content: `<@!${BOT_ID}> queue 2s`,
  })

  let match = await matches.get(matchId)
  let teams = getTeams(match.players)

  expect(teams[1]).toStrictEqual([goldUser.id, champUser.id])
  expect(teams[2]).toStrictEqual([diamondUser.id, platUser.id])

  done()
})
