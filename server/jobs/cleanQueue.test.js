// Start mock server!
require('../bot/index')
const leagues = require('../data/leagues')
const { parseMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')
const { league2s } = require('../test/league')
const { expectMatchMessage } = require('../test/messages')
const { cleanDatabase, triggerMessage } = require('../test/util')
const { goldUser, platUser, diamondUser } = require('../test/users')
const {
  TEAM_WON,
  REACT_TO_STAY_QUEUED,
  REMOVED_FROM_QUEUE,
} = require('../bot/messages')
const cleanQueue = require('../cleanQueue')
const { discord } = require('../data/util/discord')
const BOT_ID = process.env.BOT_ID
const channelId = 'test'

beforeAll(async () => {
  await cleanDatabase()
})

beforeEach(async () => {
  await leagues.create({
    ...league2s,
    channelId,
    queue: {
      [goldUser.id]: 111,
      [platUser.id]: 222,
      [diamondUser.id]: Date.now(),
    },
  })
})

afterEach(async () => {
  await cleanDatabase()
})

test('node server/jobs/cleanQueue.js', async () => {
  let league
  const channel = await discord.channels.fetch(channelId)
  const { send } = channel

  // The people who do react don't get kicked.
  channel.setReactions([[{ emoji: { name: '🌞' } }, goldUser]])
  await cleanQueue()
  expect(send).toHaveBeenCalledWith(expect.objectContaining({
    content:
      REACT_TO_STAY_QUEUED({
        teamSize: league2s.teamSize,
        userIds: [goldUser.id, platUser.id],
      })
  })
  )
  expect(send).toHaveBeenCalledWith(expect.objectContaining({
    content:
      REMOVED_FROM_QUEUE({ teamSize: league2s.teamSize, userIds: [platUser.id] })
  })
  )
  league = await leagues.get(league2s.id)
  expect(Object.keys(league.queue)).toStrictEqual(
    expect.arrayContaining([goldUser.id, diamondUser.id])
  )

  // If no one reacts, all stale players get kicked.
  channel.setReactions([])
  await cleanQueue()
  expect(send).toHaveBeenCalledWith(expect.objectContaining({
    content:
      REACT_TO_STAY_QUEUED({
        teamSize: league2s.teamSize,
        userIds: [goldUser.id],
      })
  })
  )
  expect(send).toHaveBeenCalledWith(expect.objectContaining({
    content:
      REMOVED_FROM_QUEUE({ teamSize: league2s.teamSize, userIds: [goldUser.id] })
  })
  )
  league = await leagues.get(league2s.id)
  expect(Object.keys(league.queue)).toStrictEqual([diamondUser.id])
})

// TODO: Flaky test
// test('node server/jobs/cleanQueue.js - interrupted by leave', async () => {
//   let league
//   const channel = await discord.channels.fetch(channelId)
//   const { send } = channel

//   // The people who do react don't get kicked.
//   await Promise.all([
//     cleanQueue(),
//     triggerMessage({
//       userId: goldUser.id,
//       content: `<@!${BOT_ID}> leave ${league2s.teamSize}`,
//     }),
//   ])

//   expect(send).toHaveBeenCalledWith(
//     REACT_TO_STAY_QUEUED({
//       teamSize: league2s.teamSize,
//       userIds: [goldUser.id, platUser.id],
//     })
//   )
//   expect(send).toHaveBeenCalledWith(
//     REMOVED_FROM_QUEUE({ teamSize: league2s.teamSize, userIds: [goldUser.id] })
//   )
//   expect(send).toHaveBeenCalledWith(
//     REMOVED_FROM_QUEUE({ teamSize: league2s.teamSize, userIds: [platUser.id] })
//   )
//   league = await leagues.get(league2s.id)
//   expect(Object.keys(league.queue)).toStrictEqual(
//     expect.arrayContaining([diamondUser.id])
//   )
// })
