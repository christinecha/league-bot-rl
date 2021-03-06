// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const messages = require('../bot/messages')
const leagues = require('../data/leagues')
const { discord } = require('../data/util/discord')
const { league1s, league2s, league3s } = require('../test/league')
const { guild } = require('../test/guild')
const { queueToString } = require('../util')
const BOT_ID = process.env.BOT_ID

let send, msg

const queue1 = {
  jhan: 555,
}

const queue2 = {
  jhan: 555,
  racoon: 666,
  pugs: 777,
}

const queue3 = {}

const expectQueueMessage = (msg) =>
  expect.objectContaining({
    fields: [
      expect.objectContaining({
        value: msg,
      }),
    ],
  })

beforeAll(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })

  done()
})

beforeEach(async (done) => {
  send = jest.fn()
  msg = (userId, content) => ({
    content,
    author: { id: userId },
    guild,
    channel: { send, id: 'test' },
  })

  await leagues.create({ ...league1s, queue: queue1 })
  await leagues.create({ ...league2s, queue: queue2 })
  await leagues.create({ ...league3s, queue: queue3 })
  done()
})

afterEach(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
  done()
})

test('@LeagueBot status <teamSize>', async (done) => {
  const user1 = 'average-joe'

  // Leagues' statuses should be sent.
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> status 1s`))
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> status 2s`))
  expect(send).toHaveBeenNthCalledWith(
    1,
    expectQueueMessage(queueToString(queue1))
  )
  expect(send).toHaveBeenNthCalledWith(
    2,
    expectQueueMessage(queueToString(queue2))
  )

  // When the queue is empty, it should say that instead.
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> status 3s`))
  expect(send).toHaveBeenNthCalledWith(
    3,
    expectQueueMessage('No one in the queue.')
  )

  done()
})

test('@LeagueBot status', async (done) => {
  const user1 = 'average-joe'

  // All leagues' statuses should be sent.
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> status`))
  const league1 = await leagues.get(league1s.id)
  const league2 = await leagues.get(league2s.id)
  const league3 = await leagues.get(league3s.id)

  const statusMsg = messages.STATUS_MULTIPLE({
    leagues: [league1, league2, league3],
  })
  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({ fields: statusMsg.fields })
  )
  done()
})
