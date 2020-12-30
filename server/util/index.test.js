const ERRORS = require('../constants/ERRORS')
const { guild } = require('../../test/guild')

const {
  getTeamSize,
  getTeams,
  getLeagueId,
  usersToString,
  queueToString,
} = require('.')

test('getTeamSize', () => {
  // Expected
  expect(getTeamSize('1s')).toBe(1)
  expect(getTeamSize('2s')).toBe(2)
  expect(getTeamSize('3s')).toBe(3)
  expect(getTeamSize('4s')).toBe(4)

  // Variations
  expect(getTeamSize('1')).toBe(1)
  expect(getTeamSize('3zz')).toBe(3)

  // Errors
  expect(() => getTeamSize('7s')).toThrow(ERRORS.INVALID_TEAM_SIZE)
  expect(() => getTeamSize('')).toThrow(ERRORS.INVALID_TEAM_SIZE)
  expect(() => getTeamSize()).toThrow(ERRORS.INVALID_TEAM_SIZE)
})

test('getLeagueId', () => {
  const context = { guild }

  // Expected
  expect(getLeagueId(1, context)).toBe('h000-1')
  expect(getLeagueId(2, context)).toBe('h000-2')
  expect(getLeagueId(3, context)).toBe('h000-3')
  expect(getLeagueId(4, context)).toBe('h000-4')

  // Errors
  expect(() => getLeagueId(5, context)).toThrow(ERRORS.INVALID_TEAM_SIZE)
})

test('usersToString', () => {
  const users1 = ['bart', 'art', 'fart']
  const users2 = ['124215', '324235', '232452']

  // Expected
  expect(usersToString(users1)).toMatchInlineSnapshot(
    `"<@!art> <@!bart> <@!fart>"`
  )
  expect(usersToString(users2)).toMatchInlineSnapshot(
    `"<@!124215> <@!232452> <@!324235>"`
  )
})

test('queueToString', () => {
  const queue = {
    art: 341242,
    bart: 293949,
    fart: 114552,
  }

  // Expected
  expect(queueToString(queue)).toMatchInlineSnapshot(
    `"<@!fart> <@!bart> <@!art>"`
  )
})

test('getTeams', () => {
  const players = {
    art: { team: 1 },
    fart: { team: 1 },
    wart: { team: 2 },
    bart: { team: 2 },
  }

  // Expected
  expect(getTeams(players)).toMatchInlineSnapshot(`
    Object {
      "1": Array [
        "art",
        "fart",
      ],
      "2": Array [
        "bart",
        "wart",
      ],
    }
  `)
})
