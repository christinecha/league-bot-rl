// Start mock server!
require('./index')
const leagues = require('../data/leagues')
const matches = require('../data/matches')
const ERRORS = require('../constants/ERRORS')
const { league1s, league2s, league3s } = require('../test/league')
const { getLeagueStats } = require('../util/getLeagueStats')
const { getTeams } = require('../util')
const { guild } = require('../test/guild')
const {
  expectMatchMessage,
  expectMatchVoteMessage,
} = require('../test/messages')
const {
  bronzeUser,
  silverUser,
  goldUser,
  platUser,
  diamondUser,
  champUser,
} = require('../test/users')
const { triggerMessage, cleanDatabase } = require('../test/util')
const { balanceTeams } = require('../util/balanceTeams')
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
    const msg = await triggerMessage({
      userId: goldUser.id,
      content: `<@!${BOT_ID}> queue ${teamSize}s`,
    })
    const after = Date.now()
    const { send } = msg.channel

    const league = await leagues.get(`${guild.id}-${teamSize}`)

    // The correct user is queued, at an accurate time
    expect(Object.keys(league.queue)).toStrictEqual([goldUser.id])
    expect(league.queue[goldUser.id]).toBeLessThanOrEqual(after)
    expect(league.queue[goldUser.id]).toBeGreaterThanOrEqual(before)
    expect(send).toHaveBeenCalledWith(getQueueMessage(`<@!${goldUser.id}>`))

    // The same user may not queue again.
    await triggerMessage({
      userId: goldUser.id,
      content: `<@!${BOT_ID}> queue ${teamSize}s`,
    })

    expect(send).toHaveBeenCalledWith(
      ERRORS.QUEUE_DUPLICATE_USER({
        userId: goldUser.id,
        teamSize: league.teamSize,
      })
    )
  }

  done()
})

test('@LeagueBot queue 1s', async (done) => {
  const matchId = `${league1s.id}-1`

  const msg = await triggerMessage({
    userId: goldUser.id,
    content: `<@!${BOT_ID}> queue 1s`,
  })
  const { send } = msg.channel
  await triggerMessage({
    userId: platUser.id,
    content: `<@!${BOT_ID}> queue 1s`,
  })

  // When a user queues, they should receive a message with the updated list
  expect(send).toHaveBeenCalledWith(getQueueMessage(`<@!${goldUser.id}>`))

  // When enough users queue for a match:
  // Match should be created in the database, default "random"
  const match = await matches.get(matchId)
  const teams = getTeams(match.players)

  // Match details should be correct
  expect(match.id).toBe(matchId)
  expect(match.teamSize).toBe(1)
  expect(match.league).toBe(league1s.id)
  expect(match.mode).toBe('random')
  expect(Object.keys(match.players).length).toBe(2)
  expect(teams).toMatchInlineSnapshot(`
    Object {
      "1": Array [
        "cha",
      ],
      "2": Array [
        "suhan",
      ],
    }
  `)

  // Match details should be sent
  expect(send).toHaveBeenCalledWith(expectMatchMessage(match))

  done()
})

test('@LeagueBot queue 2s', async (done) => {
  const playerIds = [goldUser.id, platUser.id, diamondUser.id, champUser.id]
  const matchId = `${league2s.id}-1`

  for (let _ in playerIds) {
    const i = parseInt(_)
    const playerId = playerIds[i]
    const msg = await triggerMessage({
      userId: playerId,
      content: `<@!${BOT_ID}> queue 2s`,
    })

    // When a user queues, they should receive a message with the updated list
    if (i !== playerIds.length - 1) {
      expect(msg.channel.send).toHaveBeenCalledWith(
        getQueueMessage(`<@!${playerId}>`)
      )
      continue
    }

    // When enough users queue for a match:
    // Match mode voting message should be sent
    expect(msg.channel.send).toHaveBeenCalledWith(
      expectMatchVoteMessage({ playerIds, teamSize: 2 })
    )

    // Bot should react with the options first!
    expect(msg.react).toHaveBeenCalledTimes(2)

    // Match should be created in the database, default "auto"
    const match = await matches.get(matchId)
    const autoTeams = await balanceTeams({
      leagueId: league2s.id,
      userIds: playerIds,
    })
    const teams = getTeams(match.players)

    // Match details should be correct
    expect(match.id).toBe(matchId)
    expect(match.teamSize).toBe(2)
    expect(match.league).toBe(league2s.id)
    expect(match.mode).toBe('auto')
    expect(Object.keys(match.players).length).toBe(4)
    expect(teams).toStrictEqual(autoTeams)

    // Match details should be sent
    expect(msg.channel.send).toHaveBeenCalledWith(expectMatchMessage(match))
  }

  done()
})

test('@LeagueBot queue 3s', async (done) => {
  const playerIds = [
    bronzeUser.id,
    silverUser.id,
    goldUser.id,
    platUser.id,
    diamondUser.id,
    champUser.id,
  ]
  const matchId = `${league3s.id}-1`

  for (let _ in playerIds) {
    const i = parseInt(_)
    const playerId = playerIds[i]
    const msg = await triggerMessage({
      userId: playerId,
      content: `<@!${BOT_ID}> queue 3s`,
    })

    // When a user queues, they should receive a message with the updated list
    if (i !== playerIds.length - 1) {
      expect(msg.channel.send).toHaveBeenCalledWith(
        getQueueMessage(`<@!${playerId}>`)
      )
      continue
    }

    // When enough users queue for a match:
    // Match mode voting message should be sent
    expect(msg.channel.send).toHaveBeenCalledWith(
      expectMatchVoteMessage({ playerIds, teamSize: 3 })
    )

    // Match should be created in the database, default "auto"
    const match = await matches.get(matchId)
    const autoTeams = await balanceTeams({
      leagueId: league3s.id,
      userIds: playerIds,
    })
    const teams = getTeams(match.players)

    // Match details should be correct
    expect(match.id).toBe(matchId)
    expect(match.teamSize).toBe(3)
    expect(match.league).toBe(league3s.id)
    expect(match.mode).toBe('auto')
    expect(Object.keys(match.players).length).toBe(6)
    expect(teams).toStrictEqual(autoTeams)

    // Match details should be sent
    expect(msg.channel.send).toHaveBeenCalledWith(expectMatchMessage(match))
  }

  done()
})
