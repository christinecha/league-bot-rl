// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const { discord } = require('../data/util/discord')
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
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
})

test('@LeagueBot <invalid-command>', async () => {
  await discord.trigger(
    'messageCreate',
    msg('cha', `<@!${BOT_ID}> fadfljadf adflkjadklfj`)
  )

  expect(send).toHaveBeenCalledWith(expect.objectContaining({
    content:
      'Sorry, I didn\'t understand that command. Try "@LeagueBot help" for more info.'
  }))
})

test('<unrelated-message>', async () => {
  await discord.trigger('messageCreate', msg('cha', `adfadf fadfljadf adflkjadklfj`))
  expect(send).not.toHaveBeenCalled()
})
