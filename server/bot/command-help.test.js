// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const leagues = require('../data/leagues')
const { discord } = require('../data/util/discord')
const ERRORS = require('./constants/ERRORS')
const { league1s, league2s, league3s } = require('../../test/league')
const BOT_ID = process.env.BOT_ID

let send, msg, react

beforeAll(async done => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })

  done()
})

beforeEach(async done => {
  send = jest.fn()
  msg = (userId, content) => ({
    content,
    author: { id: userId },
    guild: { id: 'h000' },
    channel: { send, id: '55' },
  })

  done()
})

afterEach(async done => {
  done()
})

test('@LeagueBot help', async done => {
  await discord.trigger('message', msg('flips', `<@!${BOT_ID}> help`))

  // Confirmations should be sent.
  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: 'Variables',
        }),
        expect.objectContaining({
          name: 'Commands',
        }),
      ]),
    })
  )

  done()
})
