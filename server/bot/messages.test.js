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
  expect(() => messages.CREATE_MATCH(match)).not.toThrow()
  done()
})