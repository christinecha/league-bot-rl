const { league2s } = require('../test/league');
const { user1 } = require('../test/user');
const leagues = require('./data/leagues')
const { updateQueue } = require('./queue');
const { admin } = require('./data/util/firebase')
const FieldValue = admin.firestore.FieldValue

beforeEach(async (done) => {
  await leagues.create({ ...league2s, queue: {} })
  done()
})

afterEach(async (done) => {
  await leagues.delete(league2s.id)
  done()
});

test('queue & unqueue in the 2s league', async (done) => {
  const before = Date.now()
  await updateQueue(league2s.id, user1.id, true)
  const after = Date.now()

  let league
  league = await leagues.get(league2s.id)

  // Only one user is queued
  expect(Object.keys(league.queue).length).toBe(1)

  // The correct user is queued, at an accurate time
  expect(league.queue[user1.id]).toBeLessThanOrEqual(after)
  expect(league.queue[user1.id]).toBeGreaterThanOrEqual(before)

  league = await updateQueue(league2s.id, user1.id, false)

  // No one should be in the queue now
  expect(league.queue[user1.id]).toBe(FieldValue.delete())
  done()
})