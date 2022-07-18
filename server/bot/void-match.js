const { getEmoteReactions } = require('../util/getEmoteReactions')
const { formMatchId } = require('../data/matchId')
const matches = require('../data/matches')
const ERRORS = require('../constants/ERRORS')
const { REACT_TO_VOID, MATCH_NOT_VOIDED, MATCH_VOIDED } = require('./messages')

const onVoidMatch = async (context, matchKey) => {
  try {
    const matchId = formMatchId({ guildId: context.guild.id, matchKey })
    const match = await matches.get(matchId)

    if (!match) {
      throw ERRORS.MATCH_INVALID
    }

    const reactions = await getEmoteReactions({
      validate: (_, user) => user.id === context.author.id,
      channel: context.channel,
      message: REACT_TO_VOID(matchKey),
      initialEmotes: ['✅'],
    })

    if (!reactions.length) {
      await context.channel.send({ content: MATCH_NOT_VOIDED(matchKey) })
      return
    }

    await matches.delete(matchId)
    await context.channel.send({ content: MATCH_VOIDED(matchKey) })
  } catch (err) {
    context.channel.send({ content: err })
  }
}

module.exports = { onVoidMatch }
