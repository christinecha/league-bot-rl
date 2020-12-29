const { getTeamCombos } = require('./getTeamCombos')

test('get 4s combos', async (done) => {
  const combos = getTeamCombos(4)
  expect(combos).toMatchSnapshot()
  done()
})

test('get 3s combos', async (done) => {
  const combos = getTeamCombos(3)
  expect(combos).toMatchSnapshot()
  done()
})

test('get 2s combos', async (done) => {
  const combos = getTeamCombos(2)
  expect(combos).toMatchSnapshot()
  done()
})

test('get 1s combos', async (done) => {
  const combos = getTeamCombos(1)
  expect(combos).toMatchSnapshot()
  done()
})
