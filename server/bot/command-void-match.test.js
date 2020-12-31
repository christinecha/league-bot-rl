// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const matches = require('../data/matches')
const { discord } = require('../data/util/discord')
const { parseMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')
const { match2s } = require('../test/match')
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
        filter('✅', { id: adminId })
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

test('@LeagueBot void <matchId>', async (done) => {
  const matchKey = parseMatchId(match2s.id).key

  await discord.trigger(
    'message',
    msg(plebId, `<@!${BOT_ID}> void ${matchKey}`)
  )
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MOD_ONLY)

  await discord.trigger(
    'message',
    msg(adminId, `<@!${BOT_ID}> void ${matchKey}`)
  )
  expect(send).toHaveBeenNthCalledWith(
    2,
    `Are you sure you want to erase match ${matchKey} from history? React with any emote to confirm. This action cannot be undone.`
  )

  expect(send).toHaveBeenNthCalledWith(3, `Match ${matchKey} has been voided.`)

  const match = await matches.get(match2s.id)
  expect(match).toBeFalsy()

  done()
})
