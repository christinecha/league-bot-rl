const leagues = require('../data/leagues')
const TEAM_SIZES = require('./constants/TEAM_SIZES')
const messages = require('./messages')
const { getTeamSize, getLeagueId } = require('./util')

const onStatus = async (leagueName, context) => {
  if (!leagueName) {
    TEAM_SIZES.forEach(async size => {
      const id = getLeagueId(size, context)
      const league = await leagues.get(id)
      if (league) context.channel.send(messages.QUEUE(league))
    })

    return
  }

  let teamSize

  try {
    teamSize = getTeamSize(leagueName)
  } catch (err) {
    context.channel.send(err)
    return
  }

  const id = getLeagueId(teamSize, context)
  const league = await leagues.get(id)
  context.channel.send(messages.QUEUE(league))
}

module.exports = { onStatus }