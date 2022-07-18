// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const matches = require('../data/matches')
const { discord } = require('../data/util/discord')
const { parseMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')
const { match1s, match2s } = require('../test/match')
const { guild } = require('../test/guild')
const { adminUser } = require('../test/users')
const { HELP, PREFIX_UPDATED } = require('./messages')
const { cleanDatabase, triggerMessage } = require('../test/util')
const BOT_ID = process.env.BOT_ID

let channel

beforeAll(async () => {
  await cleanDatabase()
  channel = await discord.channels.fetch('test')
})
beforeEach(async () => {
  jest.clearAllMocks()
})

afterEach(async () => {
  await cleanDatabase()
})

test('Default prefix is !', async () => {
  await triggerMessage({
    userId: adminUser.id,
    content: `!test arg1 arg2`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(expect.objectContaining({ content: `Testing! arg1,arg2` }))
})

test('Setting an invalid custom prefix', async () => {
  await triggerMessage({
    userId: adminUser.id,
    content: `!prefix argblarg`,
  })

  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(expect.objectContaining({
    content:
      'Prefix must be exactly one character.'
  })
  )

  jest.clearAllMocks()

  await triggerMessage({
    userId: adminUser.id,
    content: `!prefix `,
  })

  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(expect.objectContaining({
    content:
      'Prefix must be exactly one character.'
  })
  )
})

test('Setting a valid custom prefix', async () => {
  await triggerMessage({
    userId: adminUser.id,
    content: `!prefix ?`,
  })

  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(expect.objectContaining({ content: PREFIX_UPDATED({ prefix: '?' }) }))

  jest.clearAllMocks()

  await triggerMessage({
    userId: adminUser.id,
    content: `!test arg1 arg2`,
  })
  await triggerMessage({
    userId: adminUser.id,
    content: `?test arg1 arg2`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(expect.objectContaining({ content: `Testing! arg1,arg2` }))
})
