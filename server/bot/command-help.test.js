// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const { discord } = require('../data/util/discord')
const { getCommandsMarkdown } = require('../../shared/getCommandsMarkdown')
const { guild } = require('../test/guild')
const BOT_ID = process.env.BOT_ID

let send, msg

beforeAll(async () => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
})

beforeEach(async () => {
  send = jest.fn()
  msg = (userId, content) => ({
    content,
    author: { id: userId },
    guild,
    channel: { send, id: 'test' },
  })
})

afterEach(async () => {
})

test('@LeagueBot help', async () => {
  const commandsMarkdown = getCommandsMarkdown()
  await discord.trigger('messageCreate', msg('flips', `<@!${BOT_ID}> help`))

  // Commands
  expect(commandsMarkdown).toMatchSnapshot()

  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({
      embeds: [
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
        })]
    })
  )
})
