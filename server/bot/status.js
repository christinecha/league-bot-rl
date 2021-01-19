const leagues = require('../data/leagues')
const TEAM_SIZES = require('../constants/TEAM_SIZES')
const messages = require('./messages')
const { getTeamSize, getLeagueId } = require('../util')

const onStatus = async (context, leagueName) => {
  if (!leagueName) {
    const leaguesArr = []

    for (let size of TEAM_SIZES) {
      const id = getLeagueId(size, context)
      const league = await leagues.get(id)
      if (league) leaguesArr.push(league)
    }

    await context.channel.send(
      messages.STATUS_MULTIPLE({ leagues: leaguesArr })
    )
    return
  }

  let teamSize

  try {
    teamSize = getTeamSize(leagueName)
  } catch (err) {
    await context.channel.send(err)
    return
  }

  const id = getLeagueId(teamSize, context)
  const league = await leagues.get(id)
  await context.channel.send(messages.QUEUE(league))
}

module.exports = { onStatus }
