// Start mock server!
require('../bot/index')
const leagues = require('../data/leagues')
const { league2s, league3s } = require('../test/league')
const { cleanDatabase, triggerMessage } = require('../test/util')
const postUpdates = require('../postUpdates')
const updates = require('../_updates.json')
const { discord } = require('../data/util/discord')
const BOT_ID = process.env.BOT_ID
const channelId = 'test'

let channel

jest.mock('../_updates.json', () => {
  const now = Date.now()
  const fiveDaysAgo = now - 1000 * 60 * 60 * 24 * 5

  return [
    {
      timestamp: fiveDaysAgo + 1,
      update: 'Test 1',
    },
    {
      timestamp: fiveDaysAgo + 2,
      update: 'Test 2',
    },
    {
      timestamp: fiveDaysAgo + 3,
      update: 'Test 3',
    },
  ]
})

beforeAll(async (done) => {
  await cleanDatabase()
  channel = await discord.channels.fetch(channelId)
  done()
})

beforeEach(async (done) => {
  await leagues.create({
    ...league2s,
    channelId,
  })
  await leagues.create({
    ...league3s,
    channelId,
  })
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('node server/jobs/postUpdates.js', async (done) => {
  await postUpdates()

  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          value: `- Test 1
- Test 2
- Test 3`,
        }),
      ]),
    })
  )

  const league2 = await leagues.get(league2s.id)
  const league3 = await leagues.get(league2s.id)
  expect(league2.lastUpdate).toBe(updates[updates.length - 1].timestamp)
  expect(league3.lastUpdate).toBe(updates[updates.length - 1].timestamp)

  done()
})
