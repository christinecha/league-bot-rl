const leagues = require('../data/leagues')
const { getTeamSize, getLeagueId } = require('../util')

const onNew = async (context, leagueName) => {
  let teamSize

  try {
    teamSize = getTeamSize(leagueName)
  } catch (err) {
    context.channel.send(err)
    return
  }

  const id = getLeagueId(teamSize, context)
  const existing = await leagues.get(id)

  if (existing) {
    context.channel.send(
      `A league with team size ${teamSize} already exists in this server.`
    )
    return
  }

  context.channel.send(`Creating a new league with team size ${teamSize}.`)
  await leagues.create({
    id,
    teamSize,
    name: `${teamSize}s`,
    lastUpdate: Date.now(),
  })
}

module.exports = {
  onNew,
}
