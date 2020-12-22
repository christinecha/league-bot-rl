const { discord } = require('./data/util/discord')
const { admin } = require('./data/util/firebase')
const leagues = require('./data/leagues')
const FieldValue = admin.firestore.FieldValue
const hourMs = 1000 * 60 * 60

const getDeadPlayers = (message, stalePlayers) => {
  return new Promise((resolve) => {
    let count = 0
    const dead = stalePlayers.slice()

    const filter = (r, user) => {
      if (!stalePlayers.includes(user.id)) return
      const index = dead.indexOf(user.id)
      if (index < 0) return

      dead.splice(index, 1)
      count += 1

      if (count === stalePlayers.length) {
        resolve(dead)
      }
    }

    const tenMinutes = 1000 * 60 * 10
    message.awaitReactions(filter, { time: tenMinutes })
      .then(() => {
        resolve(dead)
      })
  })
}

const cleanQueue = async () => {
  const allLeagues = await leagues.search({ rules: [] })

  await Promise.all(allLeagues.map(league => {
    // No channel id? No message for you!
    if (!league.channelId) return Promise.resolve()

    const queue = league.queue || {}
    const players = Object.keys(queue)

    const stalePlayers = players.filter(playerId => {
      const timestamp = queue[playerId]
      return (Date.now() - timestamp) >= hourMs
    })

    if (stalePlayers.length < 1) return Promise.resolve()

    const clean = async () => {
      const channel = await discord.channels.fetch(league.channelId)
      const message = await channel.send(`Still queueing for ${league.teamSize}s, ${stalePlayers.map(p => `<@!${p}>`).join(' ')}? React with any emoji to stay in the queue.`)

      message.react('🌞')
      const dead = await getDeadPlayers(message, stalePlayers)
      if (!dead.length) {
        console.log('Nobody dead.')
        return
      }

      const updates = {}
      dead.forEach(d => {
        updates[`queue.${d}`] = FieldValue.delete()
      })

      await leagues.update({ id: league.id, ...updates })
      const verb = dead.length > 1 ? 'have' : 'has'
      await channel.send(`${dead.map(p => `<@!${p}>`).join(' ')} ${verb} been removed from the ${league.teamSize}s queue.`)
    }

    return clean()
  }))
}

module.exports = cleanQueue