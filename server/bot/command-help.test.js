// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const { discord } = require('../data/util/discord')
const { getCommandsMarkdown } = require('../../shared/getCommandsMarkdown')
const { guild } = require('../test/guild')
const BOT_ID = process.env.BOT_ID

let send, msg

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

  done()
})

afterEach(async (done) => {
  done()
})

test('@LeagueBot help', async (done) => {
  const commandsMarkdown = getCommandsMarkdown()
  await discord.trigger('message', msg('flips', `<@!${BOT_ID}> help`))

  // Commands
  expect(commandsMarkdown).toMatchSnapshot()

  // Confirmations should be sent.
  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: 'Variables',
        }),
        expect.objectContaining({
          name: 'Commands',
          value: commandsMarkdown,
        }),
      ]),
    })
  )

  done()
})
