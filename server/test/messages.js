const { usersToString, getTeams } = require('../util')
const { parseMatchId } = require('../data/matchId')

const getMatchMessage = ({ id, team1, team2 }) => {
  return expect.objectContaining({
    description: `Match ID: ${id}`,
    fields: [
      {
        name: 'Team 1',
        value: usersToString(team1),
      },
      {
        name: 'Team 2',
        value: usersToString(team2),
      },
    ],
  })
}

const expectMatchMessage = (match) => {
  const key = parseMatchId(match.id).key
  const teams = getTeams(match.players)

  return expect.objectContaining({
    description: `Match ID: ${key}`,
    fields: [
      {
        name: 'Team 1',
        value: usersToString(teams[1]),
      },
      {
        name: 'Team 2',
        value: usersToString(teams[2]),
      },
    ],
  })
}

const expectMatchVoteMessage = ({ playerIds, teamSize }) =>
  expect.objectContaining({
    fields: expect.arrayContaining([
      expect.objectContaining({
        name: `We've got a ${teamSize}s match!`,
        value: `${usersToString(playerIds)}

Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.
`,
      }),
    ]),
  })

module.exports = {
  getMatchMessage,
  expectMatchMessage,
  expectMatchVoteMessage,
}
