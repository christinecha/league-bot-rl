const { discord } = require('./data/util/discord')
const { admin } = require('./data/util/firebase')
const { usersToString } = require('./util')
const leagues = require('./data/leagues')
const { REACT_TO_STAY_QUEUED, REMOVED_FROM_QUEUE } = require('./bot/messages')
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
    message.awaitReactions(filter, { time: tenMinutes }).then(() => {
      resolve(dead)
    })
  })
}

const cleanQueue = async () => {
  const timeCheck = Date.now()
  const allLeagues = await leagues.search({
    rules: [['teamSize', '<', 4]],
  })

  await Promise.all(
    allLeagues.map((league) => {
      // No channel id? No message for you!
      if (!league.channelId) return Promise.resolve()

      const queue = league.queue || {}
      const players = Object.keys(queue)
      const doNotKick = league.doNotKick || {}

      const stalePlayers = players.filter((playerId) => {
        const timestamp = queue[playerId]
        if (doNotKick[playerId]) return false
        return Date.now() - timestamp >= hourMs
      })

      if (stalePlayers.length < 1) {
        console.log('Nobody stale.')
        return Promise.resolve()
      }

      const clean = async () => {
        const channel = await discord.channels.fetch(league.channelId)
        const message = await channel.send(
          REACT_TO_STAY_QUEUED({
            teamSize: league.teamSize,
            userIds: stalePlayers,
          })
        )

        message.react('🌞')
        const _dead = await getDeadPlayers(message, stalePlayers)
        const _league = await leagues.get(league.id)
        const _queue = _league.queue || {}
        const dead = _dead.filter((d) => _queue[d] < timeCheck)

        if (!dead.length) {
          console.log('Nobody dead.')
          return
        }

        const updates = {}
        dead.forEach((d) => {
          updates[`queue.${d}`] = FieldValue.delete()
        })

        await leagues.update({ id: league.id, ...updates })
        await channel.send(
          REMOVED_FROM_QUEUE({ teamSize: league.teamSize, userIds: dead })
        )
      }

      return clean()
    })
  )
}

module.exports = cleanQueue
