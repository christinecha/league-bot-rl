const RL_RANKS = require('../constants/RL_RANKS')

const scoreUser = user => {
  const winRatio = user.ratio ? user.ratio : 0.5
  const rankRatio = user.rank ? user.rank / RL_RANKS['SSL'] : 0.5
  return rankRatio + winRatio
}

const scoreTeam = arr => arr.reduce((s, user) => s + scoreUser(user), 0)

const balanceTeams = users => {
  // Order from highest to lowest score
  const ordered = users.sort((a, b) => scoreUser(b) - scoreUser(a))
  const teams = { 1: [], 2: [] }

  ordered.forEach(user => {
    let team = scoreTeam(teams[1]) <= scoreTeam(teams[2]) ? 1 : 2

    // Max capacity reached!
    if (teams[1].length === users.length / 2) team = 2
    if (teams[2].length === users.length / 2) team = 1

    teams[team].push(user)
  })

  return teams
}

module.exports = { balanceTeams }
