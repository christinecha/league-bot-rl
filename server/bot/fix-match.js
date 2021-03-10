const { getEmoteReactions } = require('../util/getEmoteReactions')
const { formMatchId } = require('../data/matchId')
const matches = require('../data/matches')
const ERRORS = require('../constants/ERRORS')
const { MATCH_DETAILS } = require('./messages')

const TEAM_EMOTES = {
  1: '1️⃣',
  2: '2️⃣',
}

const onFixMatch = async (context, matchKey) => {
  try {
    const matchId = formMatchId({ guildId: context.guild.id, matchKey })

    const match = await matches.get(matchId)

    if (!match) {
      throw ERRORS.MATCH_INVALID
    }

    await context.channel.send(
      'To overwrite the results of this match, react below with the correct team that won.'
    )
    const reactions = await getEmoteReactions({
      validate: (reaction, user) => {
        return (
          user.id === context.author.id &&
          Object.values(TEAM_EMOTES).includes(reaction.emoji.name)
        )
      },
      channel: context.channel,
      message: MATCH_DETAILS(match),
      initialEmotes: Object.values(TEAM_EMOTES),
    })

    const winner = Object.keys(TEAM_EMOTES).find((team) => {
      const emote = TEAM_EMOTES[team]
      return reactions.find((r) => r.reaction.emoji.name === emote)
    })

    if (!winner) {
      throw ERRORS.NO_TEAM_SELECTED
    }

    await matches.update({ id: matchId, winner: parseInt(winner) })
    await context.channel.send(`Team ${winner} won Match #${matchKey}!`)
  } catch (err) {
    context.channel.send(err)
  }
}

module.exports = { onFixMatch }
