const matches = require('../data/matches')
const { formMatchId } = require('../data/matchId')
const ERRORS = require('../constants/ERRORS')

const onCancel = async (context, matchKey) => {
  if (!matchKey) {
    await context.channel.send({ content: ERRORS.MATCH_INVALID })
    return
  }

  const matchId = formMatchId({ guildId: context.guild.id, matchKey })
  const match = await matches.get(matchId)

  if (!match) {
    await context.channel.send({ content: ERRORS.MATCH_INVALID })
    return
  }

  if (match.winner) {
    await context.channel.send({ content: ERRORS.MATCH_UNCANCELABLE })
    return
  }

  try {
    await matches.delete(matchId)
    await context.channel.send({ content: `Match #${matchKey} was canceled.` })
  } catch (err) {
    await context.channel.send({ content: err })
  }
}

module.exports = { onCancel }
