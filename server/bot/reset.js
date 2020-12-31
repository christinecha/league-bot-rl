const leagues = require('../data/leagues')
const { getEmoteReactions } = require('../util/getEmoteReactions')
const { getTeamSize, getLeagueId } = require('../util')

const onReset = async (str, context) => {
  try {
    const teamSize = getTeamSize(str)
    const leagueId = getLeagueId(teamSize, context)

    const reactions = await getEmoteReactions({
      validate: (_, user) => user.id === context.author.id,
      channel: context.channel,
      message:
        'Are you sure you want to reset this leaderboard? React with any emote to confirm. This action cannot be undone.',
      initialEmotes: ['✅'],
    })

    if (!reactions.length) {
      await context.channel.send(`${teamSize}s League was not reset.`)
      return
    }

    await leagues.update({
      id: leagueId,
      rangeStart: Date.now(),
    })

    await context.channel.send(`${teamSize}s Leaderboard was reset.`)
  } catch (err) {
    context.channel.send(err)
  }
}

module.exports = { onReset }
