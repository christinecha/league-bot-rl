const leagues = require('../data/leagues')
const matches = require('../data/matches')
const { onQueue, onUnqueue } = require('./queue')
const ERRORS = require('./constants/ERRORS')

const league1 = {
  id: 'h000-2',
  teamSize: 2,
  queue: {},
  matchCount: 2,
}
const user1 = 'pickle'

beforeEach(async (done) => {
  await leagues.create(league1)
  const l = await leagues.get(league1.id)
  done()
})

afterEach(async (done) => {
  await leagues.delete(league1.id)
  done()
});

test('queue & unqueue in the 2s league', async (done) => {
  const send = jest.fn()
  const message = {
    author: { id: user1 },
    guild: { id: 'h000' },
    channel: { send }
  }

  const before = Date.now()
  await onQueue('2s', message)
  const after = Date.now()

  let league
  league = await leagues.get(league1.id)

  // Only one user is queued
  expect(Object.keys(league.queue).length).toBe(1)

  await onQueue('2s', message)

  // User cannot queue again
  expect(send).toHaveBeenCalledWith(ERRORS.QUEUE_DUPLICATE_USER)

  // The correct user is queued, at an accurate time
  expect(league.queue[user1]).toBeLessThanOrEqual(after)
  expect(league.queue[user1]).toBeGreaterThanOrEqual(before)

  await onUnqueue('2s', message)
  league = await leagues.get(league1.id)

  // No one should be in the queue now
  expect(league.queue[user1]).toBe(undefined)

  await onUnqueue('2s', message)

  // User cannot unqueue again
  expect(send).toHaveBeenCalledWith(ERRORS.QUEUE_NO_SUCH_USER)

  done()
})

test('queue & trigger match in 2s league', async (done) => {
  const react = jest.fn()
  const send = jest.fn(() => Promise.resolve(message))
  const message = {
    author: { id: user1 },
    guild: { id: 'h000' },
    react,
    awaitReactions: () => Promise.resolve(),
    channel: { send }
  }

  await onQueue('2s', { ...message, author: { id: 'space' } })
  await onQueue('2s', { ...message, author: { id: 'dewb' } })
  await onQueue('2s', { ...message, author: { id: 'cha' } })
  await onQueue('2s', { ...message, author: { id: 'mark' } })

  // Match created in database
  const matchKey = `${league1.matchCount + 1}`
  const matchId = `${league1.id}-${matchKey}`
  const match = await matches.get(matchId)

  const queueMessage = expect.objectContaining({
    fields: [
      expect.objectContaining({
        name: '2s League Queue'
      })
    ]
  })

  // Each time a user queues, they should receive a message with the updated list
  expect(send).toHaveBeenNthCalledWith(1, queueMessage)
  expect(send).toHaveBeenNthCalledWith(2, queueMessage)
  expect(send).toHaveBeenNthCalledWith(3, queueMessage)

  // Match mode voting message sent
  expect(send).toHaveBeenNthCalledWith(4,
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          value: expect.stringMatching(/<@!(.*)> <@!(.*)> <@!(.*)> <@!(.*)>/),
        }),
      ])
    })
  )

  expect(react).toHaveBeenCalledTimes(2)

  // Match info sent to channel
  expect(send).toHaveBeenNthCalledWith(5,
    expect.objectContaining({
      description: expect.stringMatching(matchKey),
      fields: [
        {
          name: 'Team 1',
          value: expect.stringMatching(/<@!(.*)> <@!(.*)>/),
        },
        {
          name: 'Team 2',
          value: expect.stringMatching(/<@!(.*)> <@!(.*)>/),
        },
      ]
    })
  )

  expect(match).toStrictEqual(expect.objectContaining({
    id: matchId,
    teamSize: 2,
    league: league1.id,
    mode: expect.stringMatching(/(auto|random)/),
    players: expect.objectContaining({
      space: { team: expect.any(Number) },
      dewb: { team: expect.any(Number) },
      cha: { team: expect.any(Number) },
      mark: { team: expect.any(Number) },
    })
  }))

  done()
})