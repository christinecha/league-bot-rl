// Start mock server!
require('./index')
const leagues = require('../data/leagues')
const matches = require('../data/matches')
const ERRORS = require('../constants/ERRORS')
const messages = require('../bot/messages')
const { discord } = require('../data/util/discord')
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
const { triggerMessage, cleanDatabase, expectedMessage } = require('../test/util')
const { balanceTeams } = require('../util/balanceTeams')
const BOT_ID = process.env.BOT_ID
const channelId = 'test'

jest.mock('../util/getLeagueStats')
getLeagueStats.mockResolvedValue({})

const getQueueMessage = (regex) => {
  return expect.objectContaining({
    embeds: [expect.objectContaining({
      fields: ([
        expect.objectContaining({
          value: expect.stringMatching(regex),
        }),
      ]),
    })]

  })
}

beforeAll(async () => {
  await cleanDatabase()
})

beforeEach(async () => {
  await leagues.create(league1s)
  await leagues.create(league2s)
  await leagues.create(league3s)
})

afterEach(async () => {
  jest.clearAllMocks()
  const channel = await discord.channels.fetch(channelId)
  channel.setReactions([])
  await cleanDatabase()
})

test('@LeagueBot queue <league>', async () => {
  const channel = await discord.channels.fetch(channelId)
  const { send } = channel

  for (let teamSize of [1, 2, 3]) {
    const before = Date.now()
    await triggerMessage({
      userId: goldUser.id,
      content: `<@!${BOT_ID}> queue ${teamSize}s`,
    })
    const after = Date.now()

    const league = await leagues.get(`${guild.id}-${teamSize}`)

    // The correct user is queued, at an accurate time
    expect(Object.keys(league.queue)).toStrictEqual([goldUser.id])
    expect(league.queue[goldUser.id]).toBeLessThanOrEqual(after)
    expect(league.queue[goldUser.id]).toBeGreaterThanOrEqual(before)

    const statusMsg = messages.STATUS_MULTIPLE({ leagues: [league] })
    expect(send).toHaveBeenCalledWith(expectedMessage(
      statusMsg
    ))

    // The same user may not queue again.
    await triggerMessage({
      userId: goldUser.id,
      content: `<@!${BOT_ID}> queue ${teamSize}s`,
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        content:
          ERRORS.QUEUE_DUPLICATE_USER({
            userId: goldUser.id,
            teamSize: league.teamSize,
          })
      })
    )
  }
})

test('@LeagueBot queue 1s', async () => {
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
        "777",
      ],
      "2": Array [
        "suhan",
      ],
    }
  `)

  // Match details should be sent
  expect(send).toHaveBeenCalledWith(expectMatchMessage(match))
})

test('@LeagueBot queue 2s', async () => {
  const playerIds = [goldUser.id, platUser.id, diamondUser.id, champUser.id]
  const matchId = `${league2s.id}-1`

  for (let _ in playerIds) {
    const i = parseInt(_)
    const playerId = playerIds[i]

    const msg = await triggerMessage({
      userId: playerId,
      content: `<@!${BOT_ID}> queue 2s`,
      reactions: [
        [{ emoji: { name: '🤖' } }, goldUser],
        [{ emoji: { name: '🤖' } }, platUser],
      ],
    })

    // When a user queues, they should receive a message with the updated list
    if (i !== playerIds.length - 1) {
      expect(msg.channel.send).toHaveBeenCalledWith(getQueueMessage(`<@!${playerId}>`))
      continue
    }

    // When enough users queue for a match:
    // Match mode voting message should be sent
    expect(msg.channel.send).toHaveBeenNthCalledWith(4, expectMatchVoteMessage({ playerIds, teamSize: 2 }))

    // Bot should react with the options first!
    expect(msg.react).toHaveBeenCalledTimes(3)

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
    expect(msg.channel.send).toHaveBeenNthCalledWith(5, expectMatchMessage(match))
  }
})

test('@LeagueBot queue 3s', async () => {
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
      reactions: [
        [{ emoji: { name: '🤖' } }, goldUser],
        [{ emoji: { name: '🤖' } }, platUser],
        [{ emoji: { name: '🤖' } }, diamondUser],
      ],
    })

    // When a user queues, they should receive a message with the updated list
    if (i !== playerIds.length - 1) {
      expect(msg.channel.send).toHaveBeenCalledWith(getQueueMessage(`<@!${playerId}>`))
      continue
    }

    // When enough users queue for a match:
    // Match mode voting message should be sent
    expect(msg.channel.send).toHaveBeenCalledWith(expectMatchVoteMessage({ playerIds, teamSize: 3 }))

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
})

test('@LeagueBot queue 2s - then cancel', async () => {
  const playerIds = [goldUser.id, platUser.id, diamondUser.id, champUser.id]
  const matchId = `${league2s.id}-1`

  for (let _ in playerIds) {
    const i = parseInt(_)
    const playerId = playerIds[i]

    const msg = await triggerMessage({
      userId: playerId,
      content: `<@!${BOT_ID}> queue 2s`,
      reactions: [
        [{ emoji: { name: '🚫' } }, goldUser],
        [{ emoji: { name: '🚫' } }, platUser],
      ],
    })

    // When a user queues, they should receive a message with the updated list
    if (i !== playerIds.length - 1) {
      continue
    }

    // When enough users queue for a match:
    // Match mode voting message should be sent
    expect(msg.channel.send).toHaveBeenCalledWith(expectMatchVoteMessage({ playerIds, teamSize: 2 }))

    // Bot should react with the options first!
    expect(msg.react).toHaveBeenCalledTimes(3)

    expect(msg.channel.send).toHaveBeenCalledWith(expect.objectContaining({ content: `2s match has been canceled.` }))

    // Match should not have been created
    const match = await matches.get(matchId)
    expect(match).toBe(undefined)
  }
})
