const { usersToString } = require('../server/util')

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

module.exports = {
  getMatchMessage,
}
