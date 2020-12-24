const { onQueue } = require('./queue')
const leagues = require('../data/leagues')

const onBubbles = async (_, context) => {
  context.channel.send('hello bubbles')
  const guildId = context.guild.id
  const userId = context.author.id

  // queue to all leagues
  await onQueue('1', context)
  await onQueue('2', context)
  await onQueue('3', context)

  for (let i = 1; i < 4; i++) {
    const leagueId = `${guildId}-${i}`

    // add user to queue exceptions
    await leagues.update({
      id: leagueId,
      [`doNotKick.${userId}`]: true,
    })
  }
}

module.exports = {
  onBubbles
}