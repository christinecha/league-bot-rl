const allUpdates = require('./_updates.json')
const leagues = require('./data/leagues')
const { discord } = require('./data/util/discord')
const { LEAGUE_BOT_UPDATES } = require('./bot/messages')
const { sendChannelMessage } = require('./util')

const postAllUpdates = async () => {
  const channels = []

  const postUpdates = async (league) => {
    if (!league) throw 'No such guild found.'
    if (!league.channelId) throw `No channel set for league ${league.id}.`

    const now = Date.now()
    const tenDaysAgo = now - 1000 * 60 * 60 * 24 * 10
    const lastUpdate = league.lastUpdate || tenDaysAgo
    const updates = allUpdates
      .filter((u) => u.timestamp > lastUpdate && u.timestamp < now)
      .sort((a, b) => a.timestamp - b.timestamp)

    // No updates for me!
    if (!updates.length) return

    const alreadyCovered = channels.includes(league.channelId)

    // Do not duplicate messages in the same channel.
    if (!alreadyCovered) {
      channels.push(league.channelId)
      const channel = await discord.channels.fetch(league.channelId)
      if (!channel) throw 'No such channel found.'

      await sendChannelMessage(
        channel,
        LEAGUE_BOT_UPDATES({
          updates,
        })
      )
    }

    const newLast = updates[updates.length - 1]
    await leagues.update({ id: league.id, lastUpdate: newLast.timestamp })
  }

  const allLeagues = await leagues.search({ rules: [] })

  await Promise.all(
    allLeagues.map((league) =>
      postUpdates(league)
        .then(() => {
          console.log('SUCCESS:', league.id)
        })
        .catch((err) => {
          console.log('ERROR:', err)
        })
    )
  ).finally(() => {
    console.log('Update posting complete.')
  })
}

module.exports = postAllUpdates
