const ERRORS = require('../constants/ERRORS')

const getTeamSize = str => {
  const teamSize = parseInt(str)
  if (![1, 2, 3, 4].includes(teamSize)) throw ERRORS.INVALID_TEAM_SIZE
  return teamSize
}

const getLeagueId = (_teamSize, context) => {
  const teamSize = getTeamSize(_teamSize)
  return `${context.guild.id}-${teamSize}`
}

const usersToString = users =>
  users
    .sort()
    .map(p => `<@!${p}>`)
    .join(' ')

const queueToString = queue =>
  Object.keys(queue)
    .sort((a, b) => queue[a] - queue[b])
    .map(p => `<@!${p}>`)
    .join(' ')

const getTeams = players => {
  const playerIds = Object.keys(players)
  const team1 = playerIds.sort().filter(p => players[p].team === 1)
  const team2 = playerIds.sort().filter(p => players[p].team === 2)

  return { 1: team1, 2: team2 }
}

module.exports = {
  getTeamSize,
  getLeagueId,
  usersToString,
  queueToString,
  getTeams,
}
