// Start mock server!
require('./index')
const firebase = require('@firebase/rules-unit-testing')
const leagues = require('../data/leagues')
const matches = require('../data/matches')
const { discord } = require('../data/util/discord')
const { getLeagueStats } = require('../util/getLeagueStats')
const ERRORS = require('../constants/ERRORS')
const { match2s } = require('../test/match')
const { league2s } = require('../test/league')
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

  await leagues.create(league2s)
  await matches.create({ ...match2s, id: `${league2s.id}-1`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-2`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-3`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-4`, winner: 2 })
  await matches.create({ ...match2s, id: `${league2s.id}-5`, winner: 2 })
  done()
})

afterEach(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  })
  done()
})

test('@LeagueBot reset <teamSize>', async (done) => {
  let stats = await getLeagueStats(league2s.id)
  expect(stats).toMatchSnapshot()

  await discord.trigger('message', msg(plebId, `<@!${BOT_ID}> reset 2`))
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MOD_ONLY)

  await discord.trigger('message', msg(adminId, `<@!${BOT_ID}> reset 2`))
  expect(send).toHaveBeenNthCalledWith(
    2,
    'Are you sure you want to reset this leaderboard? React with any emote to confirm. This action cannot be undone.'
  )

  expect(send).toHaveBeenNthCalledWith(3, '2s Leaderboard was reset.')

  stats = await getLeagueStats(league2s.id)
  expect(stats).toStrictEqual({})

  done()
})
