// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const matches = require('../data/matches')
const { discord } = require('../data/util/discord')
const { parseMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')
const { match2s } = require('../test/match')
const { getMatchMessage } = require('../test/messages')
const { getTeams } = require('../util')
const BOT_ID = process.env.BOT_ID

const adminId = 'cha'
const plebId = 'noodle'
let send, msg, react, guild

beforeAll(async (done) => {
  guild = await discord.guilds.fetch('h000')
  discord.setUsers({
    [adminId]: { permissions: ['ADMINISTRATOR'] },
    [plebId]: { permissions: [] },
  })

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
      awaitReactions: async (filter) => {
        filter({ _emoji: { name: '2️⃣' } }, { id: adminId })
      },
    })
  )
  msg = (userId, content) => ({
    content,
    author: { id: userId },
    guild,
    channel: { send, id: '55' },
  })

  await matches.create(match2s)
  done()
})

afterEach(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
  done()
})

test('@LeagueBot fix <matchId>', async (done) => {
  const matchKey = parseMatchId(match2s.id).key
  const teams = getTeams(match2s.players)

  await discord.trigger('message', msg(plebId, `<@!${BOT_ID}> fix ${matchKey}`))
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MOD_ONLY)

  await discord.trigger(
    'message',
    msg(adminId, `<@!${BOT_ID}> fix ${matchKey}`)
  )
  expect(send).toHaveBeenNthCalledWith(
    2,
    'To overwrite the results of this match, react below with the correct team that won.'
  )
  expect(send).toHaveBeenNthCalledWith(
    3,
    getMatchMessage({ id: matchKey, team1: teams[1], team2: teams[2] })
  )

  expect(send).toHaveBeenNthCalledWith(4, `Team 2 won Match #${matchKey}!`)

  const match = await matches.get(match2s.id)
  expect(match.winner).toBe(2)

  done()
})
