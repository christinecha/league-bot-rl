// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const matches = require('../data/matches')
const { discord } = require('../data/util/discord')
const { parseMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')
const { match1s } = require('../test/match')
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

  await matches.create(match1s)
})

afterEach(async () => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
})

test('@LeagueBot win <matchId>', async () => {
  const user1 = Object.keys(match1s.players)[0]
  const user2 = 'gobbledigook'
  const match1Key = parseMatchId(match1s.id).key

  // A user that was not in the match may not report the match.
  await discord.trigger('messageCreate', msg(user2, `<@!${BOT_ID}> win ${match1Key}`))
  expect(send).toHaveBeenNthCalledWith(1, expect.objectContaining({ content: ERRORS.MATCH_NO_SUCH_USER }))

  // When reported correctly, winner should be set correctly in the database.
  await discord.trigger('messageCreate', msg(user1, `<@!${BOT_ID}> win ${match1Key}`))
  const match1 = await matches.get(match1s.id)
  const winner = match1s.players[user1].team
  expect(match1.winner).toBe(winner)
  expect(send).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ content: expect.stringContaining(`Team ${winner} won Match #${match1Key}!`) })
  )

  // An already reported match may not be re-reported.
  await discord.trigger('messageCreate', msg(user1, `<@!${BOT_ID}> win ${match1Key}`))
  expect(send).toHaveBeenNthCalledWith(3, expect.objectContaining({ content: ERRORS.MATCH_DUPLICATE_REPORT }))
})

test('@LeagueBot loss <matchId>', async () => {
  const user1 = Object.keys(match1s.players)[0]
  const user2 = 'gobbledigook'
  const match1Key = parseMatchId(match1s.id).key

  // A user that was not in the match may not report the match.
  await discord.trigger(
    'messageCreate',
    msg(user2, `<@!${BOT_ID}> loss ${match1Key}`)
  )
  expect(send).toHaveBeenNthCalledWith(1, expect.objectContaining({ content: ERRORS.MATCH_NO_SUCH_USER }))

  // When reported correctly, winner should be set correctly in the database.
  await discord.trigger(
    'messageCreate',
    msg(user1, `<@!${BOT_ID}> loss ${match1Key}`)
  )
  const match1 = await matches.get(match1s.id)
  const winner = match1s.players[user1].team === 1 ? 2 : 1
  expect(match1.winner).toBe(winner)
  expect(send).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ content: expect.stringContaining(`Team ${winner} won Match #${match1Key}!`) })
  )

  // An already reported match may not be re-reported.
  await discord.trigger(
    'messageCreate',
    msg(user1, `<@!${BOT_ID}> loss ${match1Key}`)
  )
  expect(send).toHaveBeenNthCalledWith(3, expect.objectContaining({ content: ERRORS.MATCH_DUPLICATE_REPORT }))
})

test('@LeagueBot loss/win - invalid', async () => {
  await discord.trigger('messageCreate', msg('bub', `<@!${BOT_ID}> loss`))
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ content: ERRORS.MATCH_INVALID }))
})
