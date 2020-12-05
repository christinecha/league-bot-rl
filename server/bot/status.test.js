const leagues = require('../data/leagues')
const { onStatus } = require('./status')

const league1 = {
  id: 'h000-2',
  teamSize: 2,
  queue: {}
}

beforeEach(async (done) => {
  await leagues.create(league1)
  done()
})

afterEach(async (done) => {
  await leagues.delete(league1.id)
  done()
});

test('check league status', async (done) => {
  const send = jest.fn()

  await onStatus('2', {
    author: { id: 'user1' },
    guild: { id: 'h000' },
    channel: { send }
  })

  // League queue should be called
  expect(send).toHaveBeenCalledWith(expect.objectContaining({
    fields: [
      { name: `2s League Queue`, value: 'No one in the queue.' }
    ]
  }))

  done()
})