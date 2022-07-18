// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const leagues = require('../data/leagues')
const { discord } = require('../data/util/discord')
const ERRORS = require('../constants/ERRORS')
const { league1s, league2s, league3s } = require('../test/league')
const { guild } = require('../test/guild')
const BOT_ID = process.env.BOT_ID

let send, msg, react
const users = ['suhan', 'tandk', 'caudex']

beforeAll(async () => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
})

beforeEach(async () => {
  react = jest.fn()
  send = jest.fn(() =>
    Promise.resolve({
      react,
      awaitReactions: () => Promise.resolve(),
    })
  )
  msg = (userId, content) => ({
    content,
    author: { id: userId },
    guild,
    channel: { send, id: 'test' },
  })

  const queue = {}
  users.forEach((u, i) => (queue[u] = i + 1000))

  await leagues.create({ ...league1s, queue })
  await leagues.create({ ...league2s, queue })
  await leagues.create({ ...league3s, queue })
})

afterEach(async () => {
  await leagues.delete(league1s.id)
  await leagues.delete(league2s.id)
  await leagues.delete(league3s.id)
})

test('@LeagueBot clear <league>', async () => {
  await discord.trigger('messageCreate', msg(users[0], `<@!${BOT_ID}> clear 1s`))
  await discord.trigger('messageCreate', msg(users[0], `<@!${BOT_ID}> clear 2s`))
  await discord.trigger('messageCreate', msg(users[0], `<@!${BOT_ID}> clear 3s`))

  // Confirmations should be sent.
  expect(send).toHaveBeenNthCalledWith(1, expect.objectContaining({ content: `1s queue has been cleared.` }))
  expect(send).toHaveBeenNthCalledWith(2, expect.objectContaining({ content: `2s queue has been cleared.` }))
  expect(send).toHaveBeenNthCalledWith(3, expect.objectContaining({ content: `3s queue has been cleared.` }))

  const league1 = await leagues.get(league1s.id)
  const league2 = await leagues.get(league2s.id)
  const league3 = await leagues.get(league3s.id)

  // The user was removed from each queue
  expect(league1.queue).toStrictEqual({})
  expect(league2.queue).toStrictEqual({})
  expect(league3.queue).toStrictEqual({})
})

test('@LeagueBot clear', async () => {
  // No team size specified? No clear for you.
  await discord.trigger('messageCreate', msg(users[0], `<@!${BOT_ID}> clear`))
  expect(send).toHaveBeenNthCalledWith(1, expect.objectContaining({ content: ERRORS.INVALID_TEAM_SIZE }))
})
