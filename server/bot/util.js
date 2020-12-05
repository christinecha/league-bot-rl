const ERRORS = require('./constants/ERRORS')

const getTeamSize = (str) => {
  const teamSize = parseInt(str)
  if (![1, 2, 3].includes(teamSize)) throw (ERRORS.INVALID_TEAM_SIZE)
  return teamSize
}

const getLeagueId = (teamSize, context) => `${context.guild.id}-${teamSize}`

module.exports = {
  getTeamSize,
  getLeagueId
}