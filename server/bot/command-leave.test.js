// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const leagues = require('../data/leagues')
const { discord } = require('../data/util/discord')
const messages = require('./messages')
const ERRORS = require('../constants/ERRORS')
const { league1s, league2s, league3s } = require('../../test/league')
const { guild } = require('../../test/guild')
const BOT_ID = process.env.BOT_ID

let send, msg, react
const users = ['suhan', 'tandk', 'caudex']

beforeAll(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })

  done()
})

beforeEach(async (done) => {
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
    channel: { send, id: '55' },
  })

  const queue = {}
  users.forEach((u, i) => (queue[u] = i + 1000))

  await leagues.create({ ...league1s, queue })
  await leagues.create({ ...league2s, queue })
  await leagues.create({ ...league3s, queue })
  done()
})

afterEach(async (done) => {
  await leagues.delete(league1s.id)
  await leagues.delete(league2s.id)
  await leagues.delete(league3s.id)
  done()
})

test('@LeagueBot leave <league>', async (done) => {
  await discord.trigger('message', msg(users[0], `<@!${BOT_ID}> leave 1s`))
  await discord.trigger('message', msg(users[0], `<@!${BOT_ID}> leave 2s`))
  await discord.trigger('message', msg(users[0], `<@!${BOT_ID}> leave 3s`))

  // Confirmations should be sent.
  expect(send).toHaveBeenNthCalledWith(
    1,
    messages.LEAVE_QUEUE({ userId: users[0], teamSize: 1 })
  )
  expect(send).toHaveBeenNthCalledWith(
    2,
    messages.LEAVE_QUEUE({ userId: users[0], teamSize: 2 })
  )
  expect(send).toHaveBeenNthCalledWith(
    3,
    messages.LEAVE_QUEUE({ userId: users[0], teamSize: 3 })
  )

  let league1 = await leagues.get(league1s.id)
  let league2 = await leagues.get(league2s.id)
  let league3 = await leagues.get(league3s.id)

  // The user was removed from each queue
  expect(Object.keys(league1.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league2.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league3.queue)).toStrictEqual([users[1], users[2]])

  await discord.trigger('message', msg(users[0], `<@!${BOT_ID}> leave 1s`))
  await discord.trigger('message', msg(users[0], `<@!${BOT_ID}> leave 2s`))
  await discord.trigger('message', msg(users[0], `<@!${BOT_ID}> leave 3s`))

  // The same user may not leave again.
  expect(send).toHaveBeenNthCalledWith(4, ERRORS.QUEUE_NO_SUCH_USER)
  expect(send).toHaveBeenNthCalledWith(5, ERRORS.QUEUE_NO_SUCH_USER)
  expect(send).toHaveBeenNthCalledWith(6, ERRORS.QUEUE_NO_SUCH_USER)

  done()
})
