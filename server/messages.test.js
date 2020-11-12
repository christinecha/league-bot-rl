const messages = require('./messages')

const match = {
  id: '12345',
  teamSize: 2,
  players: {
    ginge: { team: 1 },
    bubbles: { team: 2 },
    cheese: { team: 1 },
    duke: { team: 2 },
  }
}

test('message: CREATE_MATCH', async (done) => {
  const message = messages.CREATE_MATCH(match)

  expect(message.title).toBe('2s Match!!!')
  expect(message.description).toBe(`id: ${match.id}`)
  expect(message.fields).toStrictEqual([
    {
      inline: false,
      name: 'Team 1',
      value: `<@!ginge> <@!cheese>`,
    },
    {
      inline: false,
      name: 'Team 2',
      value: `<@!bubbles> <@!duke>`,
    },
  ])

  done()
})