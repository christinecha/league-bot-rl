// Start mock server!
require('./index')
const guilds = require('../data/guilds')
const { discord } = require('../data/util/discord')
const ERRORS = require('../constants/ERRORS')
const { adminUser, goldUser, adminUser2 } = require('../test/users')
const { cleanDatabase, triggerMessage } = require('../test/util')

const CHANNEL_ID = 'test'

let channel

beforeAll(async (done) => {
  await cleanDatabase()
  channel = await discord.channels.fetch(CHANNEL_ID)
  done()
})
beforeEach(async (done) => {
  jest.clearAllMocks()
  done()
})

afterEach(async (done) => {
  await cleanDatabase()
  done()
})

test('Only admins are mods by default', async (done) => {
  await triggerMessage({
    userId: adminUser.id,
    content: `!test-mod arg1 arg2`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(`You're a mod! arg1,arg2`)
  jest.clearAllMocks()

  await triggerMessage({
    userId: goldUser.id,
    content: `!test-mod arg1 arg2`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(ERRORS.MOD_ONLY)

  done()
})

test('Mods can add & remove other mods', async (done) => {
  /* ADD A MOD */
  await triggerMessage({
    userId: adminUser.id,
    content: `!mod <@!${goldUser.id}>`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(
    `<@!${goldUser.id}> can now use League Bot mod commands in this server.`
  )

  let guild = await guilds.get(channel.guild.id)
  expect(guild.mods).toStrictEqual(
    expect.objectContaining({
      [goldUser.id]: true,
    })
  )

  /* CHECK IF THE MOD HAS POWERS */
  jest.clearAllMocks()
  await triggerMessage({
    userId: goldUser.id,
    content: `!test-mod arg1 arg2`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(`You're a mod! arg1,arg2`)

  /* REMOVE THE MOD */
  jest.clearAllMocks()
  await triggerMessage({
    userId: adminUser.id,
    content: `!unmod <@!${goldUser.id}>`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(
    `<@!${goldUser.id}> can no longer use League Bot mod commands in this server.`
  )

  guild = await guilds.get(channel.guild.id)
  expect(guild.mods).toStrictEqual({})

  /* CHECK POWERS AGAIN */
  jest.clearAllMocks()
  await triggerMessage({
    userId: goldUser.id,
    content: `!test-mod arg1 arg2`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(ERRORS.MOD_ONLY)

  done()
})

test('Admins cannot be modded', async (done) => {
  await triggerMessage({
    userId: adminUser.id,
    content: `!mod <@!${adminUser2.id}>`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(
    'Server admins have mod access to LeagueBot by default.'
  )

  const guild = await guilds.get(channel.guild.id)
  expect(guild.mods).toBe(undefined)

  done()
})

test('Admins cannot be unmodded', async (done) => {
  await triggerMessage({
    userId: adminUser.id,
    content: `!unmod <@!${adminUser2.id}>`,
  })
  expect(channel.send).toHaveBeenCalledTimes(1)
  expect(channel.send).toHaveBeenCalledWith(
    'Server admins have mod access to LeagueBot by default.'
  )

  const guild = await guilds.get(channel.guild.id)
  expect(guild.mods).toBe(undefined)

  done()
})
