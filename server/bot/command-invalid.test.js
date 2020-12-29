// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const { discord } = require('../data/util/discord')
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
    guild: { id: 'h000' },
    channel: { send, id: '55' },
  })

  done()
})

afterEach(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
  done()
})

test('@LeagueBot <invalid-command>', async (done) => {
  await discord.trigger(
    'message',
    msg('cha', `<@!${BOT_ID}> fadfljadf adflkjadklfj`)
  )

  expect(send).toHaveBeenCalledWith(
    'Sorry, I didn\'t understand that command. Try "@LeagueBot help" for more info.'
  )

  done()
})

test('<unrelated-message>', async (done) => {
  await discord.trigger('message', msg('cha', `adfadf fadfljadf adflkjadklfj`))
  expect(send).not.toHaveBeenCalled()

  done()
})
