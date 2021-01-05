const { onQueue } = require('./queue')
const leagues = require('../data/leagues')

const BUBBLES_ID = '362052637400498187'

const onBubbles = async (context) => {
  const guildId = context.guild.id
  const userId = context.author.id

  if (userId !== BUBBLES_ID) {
    context.channel.send("You don't look like Bubbles.")
    return
  }

  context.channel.send('Hello, Bubbles 👋')

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
  onBubbles,
}
