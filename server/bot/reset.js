const leagues = require('../data/leagues')
const { getEmoteReactions } = require('../util/getEmoteReactions')
const { getTeamSize, getLeagueId } = require('../util')
const {
  LEADERBOARD_NOT_RESET,
  LEADERBOARD_RESET,
  REACT_TO_RESET,
} = require('./messages')

const onReset = async (context, str) => {
  try {
    const teamSize = getTeamSize(str)
    const leagueId = getLeagueId(teamSize, context)

    const reactions = await getEmoteReactions({
      validate: (_, user) => user.id === context.author.id,
      channel: context.channel,
      message: REACT_TO_RESET(teamSize),
      initialEmotes: ['✅'],
    })

    if (!reactions.length) {
      await context.channel.send(LEADERBOARD_NOT_RESET(teamSize))
      return
    }

    await leagues.update({
      id: leagueId,
      rangeStart: Date.now(),
    })

    await context.channel.send(LEADERBOARD_RESET(teamSize))
  } catch (err) {
    context.channel.send(err)
  }
}

module.exports = { onReset }
