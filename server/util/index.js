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

module.exports = {
  getTeamSize,
  getLeagueId,
  usersToString,
  queueToString,
}
