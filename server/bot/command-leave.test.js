// Start mock server!
require('./index')
const leagues = require('../data/leagues')
const { discord } = require('../data/util/discord')
const messages = require('./messages')
const ERRORS = require('../constants/ERRORS')
const { league1s, league2s, league3s } = require('../test/league')
const { cleanDatabase, triggerMessage, expectedMessage } = require('../test/util')
const BOT_ID = process.env.BOT_ID

const users = ['suhan', 'tandk', 'caudex']

beforeAll(async () => {
  await cleanDatabase()
})
beforeEach(async () => {
  const queue = {}
  users.forEach((u, i) => (queue[u] = i + 1000))

  await leagues.create({ ...league1s, queue })
  await leagues.create({ ...league2s, queue })
  await leagues.create({ ...league3s, queue })
})

afterEach(async () => {
  jest.clearAllMocks()
  await cleanDatabase()
})

test('@LeagueBot leave <league>', async () => {
  const { send } = await discord.channels.fetch('test')
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave 1s`,
  })
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave 2s`,
  })
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave 3s`,
  })

  let league1 = await leagues.get(league1s.id)
  let league2 = await leagues.get(league2s.id)
  let league3 = await leagues.get(league3s.id)

  // Confirmations should be sent.
  expect(send).toHaveBeenNthCalledWith(
    1,
    expectedMessage(messages.STATUS_MULTIPLE({
      leagues: [league1],
    })
    )
  )
  expect(send).toHaveBeenNthCalledWith(
    2,
    expectedMessage(messages.STATUS_MULTIPLE({
      leagues: [league2],
    })
    )
  )

  expect(send).toHaveBeenNthCalledWith(
    3,
    expectedMessage(messages.STATUS_MULTIPLE({
      leagues: [league3],
    }))
  )

  // The user was removed from each queue
  expect(Object.keys(league1.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league2.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league3.queue)).toStrictEqual([users[1], users[2]])
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave 1s`,
  })
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave 2s`,
  })
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave 3s`,
  })

  // The same user may not leave again.
  expect(send).toHaveBeenNthCalledWith(4, expect.objectContaining({ content: ERRORS.QUEUE_NO_SUCH_USER }))
  expect(send).toHaveBeenNthCalledWith(5, expect.objectContaining({ content: ERRORS.QUEUE_NO_SUCH_USER }))
  expect(send).toHaveBeenNthCalledWith(6, expect.objectContaining({ content: ERRORS.QUEUE_NO_SUCH_USER }))
})

test('@LeagueBot leave', async () => {
  const { send } = await discord.channels.fetch('test')
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave`,
  })

  let league1 = await leagues.get(league1s.id)
  let league2 = await leagues.get(league2s.id)
  let league3 = await leagues.get(league3s.id)

  // Confirmations should be sent.
  const statusMsg = messages.STATUS_MULTIPLE({
    leagues: [league1, league2, league3],
  })
  expect(send).toHaveBeenCalledWith(expectedMessage(statusMsg))

  // The user was removed from each queue
  expect(Object.keys(league1.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league2.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league3.queue)).toStrictEqual([users[1], users[2]])

  await triggerMessage({
    userId: users[1],
    content: `<@!${BOT_ID}> leave 1s`,
  })

  jest.clearAllMocks()

  await triggerMessage({
    userId: users[1],
    content: `<@!${BOT_ID}> leave`,
  })

  league1 = await leagues.get(league1s.id)
  league2 = await leagues.get(league2s.id)
  league3 = await leagues.get(league3s.id)

  expect(send).toHaveBeenCalledWith(expectedMessage(messages.STATUS_MULTIPLE({
    leagues: [league2, league3],
  }))
  )
})

test('@LeagueBot leave all', async () => {
  const { send } = await discord.channels.fetch('test')
  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave all`,
  })

  let league1 = await leagues.get(league1s.id)
  let league2 = await leagues.get(league2s.id)
  let league3 = await leagues.get(league3s.id)

  // Confirmations should be sent.
  expect(send).toHaveBeenCalledWith(expectedMessage(messages.STATUS_MULTIPLE({
    leagues: [league1, league2, league3],
  }))
  )

  // The user was removed from each queue
  expect(Object.keys(league1.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league2.queue)).toStrictEqual([users[1], users[2]])
  expect(Object.keys(league3.queue)).toStrictEqual([users[1], users[2]])

  await triggerMessage({
    userId: users[0],
    content: `<@!${BOT_ID}> leave`,
  })

  expect(send).toHaveBeenCalledWith(expectedMessage(
    ERRORS.QUEUE_NOT_IN_ANY({ userId: users[0] })
  )
  )

  // TODO: ... fix this
  await new Promise(resolve => setTimeout(resolve, 100))
})
