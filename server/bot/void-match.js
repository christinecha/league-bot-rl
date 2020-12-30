const { getEmoteConfirmation } = require('../util/getEmoteConfirmation')
const { formMatchId } = require('../data/matchId')
const matches = require('../data/matches')
const ERRORS = require('../constants/ERRORS')

const onVoidMatch = async (matchKey, context) => {
  try {
    const matchId = formMatchId({ guildId: context.guild.id, matchKey })

    const match = await matches.get(matchId)

    if (!match) {
      throw ERRORS.MATCH_INVALID
    }

    try {
      await getEmoteConfirmation({
        validate: (_, user) => user.id === context.author.id,
        channel: context.channel,
        message: `Are you sure you want to erase match ${matchKey} from history? React with any emote to confirm. This action cannot be undone.`,
        emote: '✅',
        timeLimit: 1000 * 60 * 2,
      })
    } catch (err) {
      await context.channel.send(`Match ${matchKey} was not voided.`)
      return
    }

    await matches.delete(matchId)
    await context.channel.send(`Match ${matchKey} has been voided.`)
  } catch (err) {
    context.channel.send(err)
  }
}

module.exports = { onVoidMatch }
