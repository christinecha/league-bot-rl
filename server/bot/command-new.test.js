// Start mock server!
require('./index')
const ERRORS = require('../constants/ERRORS')
const firebase = require('@firebase/rules-unit-testing')
const leagues = require('../data/leagues')
const { discord } = require('../data/util/discord')
const { guild } = require('../../test/guild')
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

test('@LeagueBot new <teamSize>', async (done) => {
  const user1 = 'average-joe'
  const teamSizes = [1, 2, 3]

  // Leagues' statuses should be sent.
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> new 1s`))
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> new 2s`))
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> new 3s`))

  const league1 = await leagues.get(`${guild.id}-1`)
  const league2 = await leagues.get(`${guild.id}-2`)
  const league3 = await leagues.get(`${guild.id}-3`)

  for (let i in teamSizes) {
    const teamSize = teamSizes[i]
    expect(send).toHaveBeenNthCalledWith(
      parseInt(i) + 1,
      `Creating a new league with team size ${teamSize}.`
    )
  }

  expect(league1).toStrictEqual(
    expect.objectContaining({
      id: 'h000-1',
      name: '1s',
      teamSize: 1,
      timestamp: expect.any(Number),
    })
  )

  expect(league2).toStrictEqual(
    expect.objectContaining({
      id: 'h000-2',
      name: '2s',
      teamSize: 2,
      timestamp: expect.any(Number),
    })
  )

  expect(league3).toStrictEqual(
    expect.objectContaining({
      id: 'h000-3',
      name: '3s',
      teamSize: 3,
      timestamp: expect.any(Number),
    })
  )

  // Cannot duplicate a league.
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> new 1s`))
  expect(send).toHaveBeenNthCalledWith(
    teamSizes.length + 1,
    `A league with team size 1 already exists in this server.`
  )

  // No team size? No league!
  await discord.trigger('message', msg(user1, `<@!${BOT_ID}> new`))
  expect(send).toHaveBeenNthCalledWith(
    teamSizes.length + 2,
    ERRORS.INVALID_TEAM_SIZE
  )

  done()
})
