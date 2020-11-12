const { match2s } = require('../test/match')
const matches = require('./data/matches')
const messages = require('./messages')

beforeEach(async (done) => {
  await matches.create(match2s)
  done()
})

afterEach(async (done) => {
  await matches.delete(match2s.id)
  done()
});

test('message: CREATE_MATCH', async (done) => {
  const match = await matches.get(match2s.id)
  const message = messages.CREATE_MATCH(match)

  expect(message.title).toBe('2 Match!!!')
  expect(message.description).toBe(`id: ${match2s.id}`)
  expect(message.fields).toStrictEqual([
    {
      inline: false,
      name: 'Team 1',
      value: `<@!stardust> <@!mark>`,
    },
    {
      inline: false,
      name: 'Team 2',
      value: `<@!space> <@!bubbles>`,
    },
  ])

  done()
})