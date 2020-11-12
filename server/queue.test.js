const leagues = require('./data/leagues')
const { onQueue, onUnqueue } = require('./queue');
const ERRORS = require('./constants/ERRORS')

const league1 = {
  id: 'hooo-crew-2',
  teamSize: 2,
}
const user1 = 'pickle'

beforeEach(async (done) => {
  await leagues.create(league1)
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
    guild: { id: 'hooo-crew' },
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
  const send = jest.fn()
  const message = {
    author: { id: user1 },
    guild: { id: 'hooo-crew' },
    channel: { send }
  }

  await onQueue('2s', { ...message, author: { id: 'space' } })
  await onQueue('2s', { ...message, author: { id: 'dewb' } })
  await onQueue('2s', { ...message, author: { id: 'cha' } })
  await onQueue('2s', { ...message, author: { id: 'mark' } })

  // Match created & sent to channel
  expect(send).toHaveBeenNthCalledWith(5,
    expect.objectContaining({
      title: '2s Match!!!',
      fields: [
        {
          inline: false,
          name: 'Team 1',
          value: expect.stringMatching(/<@!(.*)> <@!(.*)>/),
        },
        {
          inline: false,
          name: 'Team 2',
          value: expect.stringMatching(/<@!(.*)> <@!(.*)>/),
        },
      ]
    })
  )

  done()
})