const leagues = require('../data/leagues')
const createMatch = require('./createMatch')
const messages = require('./messages')
const ERRORS = require('./constants/ERRORS')
const { admin } = require('../data/util/firebase')
const FieldValue = admin.firestore.FieldValue

const getTeamSize = (str) => {
  const teamSize = parseInt(str)
  if (![1, 2, 3].includes(teamSize)) throw (ERRORS.INVALID_TEAM_SIZE)
  return teamSize
}

const updateQueue = async (leagueId, userId, shouldQueue) => {
  const league = await leagues.get(leagueId)
  if (!league) throw (ERRORS.NO_SUCH_LEAGUE)

  const queue = league.queue || {}

  if (shouldQueue && queue[userId]) throw (ERRORS.QUEUE_DUPLICATE_USER)
  if (!shouldQueue && !queue[userId]) throw (ERRORS.QUEUE_NO_SUCH_USER)

  const newValue = shouldQueue ? Date.now() : FieldValue.delete()
  const update = { [`queue.${userId}`]: newValue }
  await leagues.update({ id: leagueId, ...update })

  const newLeague = {
    ...league,
    queue: {
      ...queue,
      [userId]: newValue
    }
  }

  if (!shouldQueue) delete newLeague.queue[userId]
  return newLeague
}

const MATCH_MODE = {
  AUTO: 'auto',
  RANDOM: 'random'
}

const MODE_EMOTE = {
  '🤖': MATCH_MODE.AUTO,
  '👻': MATCH_MODE.RANDOM
}

const getMatchMode = async ({ message, playerIds }) => {
  return new Promise((resolve, reject) => {
    message.react('🤖')
    message.react('👻')

    const modes = {
      [MATCH_MODE.AUTO]: 0,
      [MATCH_MODE.RANDOM]: 0
    }

    const filter = (reaction, user) => {
      if (!playerIds.includes(user.id)) return

      const selected = MODE_EMOTE[reaction.emoji.name]
      if (selected) modes[selected] += 1

      const official = Object.keys(modes).find(k => modes[k] >= playerIds.length * 0.5)
      if (!official) return

      resolve(official)
    }

    const twoMinutes = 1000 * 60 * 2
    message.awaitReactions(filter, { time: twoMinutes })
      .then(() => {
        if (modes[MATCH_MODE.AUTO] >= modes[MATCH_MODE.RANDOM]) resolve(MATCH_MODE.AUTO)
        resolve(MATCH_MODE.RANDOM)
      })
  })
}

const getMatchPlayers = async (leagueId) => {
  const league = await leagues.get(leagueId)
  const { queue, teamSize } = league

  const allPlayers = Object.keys(queue).sort((a, b) => queue[a] - queue[b])
  const queuedPlayers = allPlayers.slice(0, teamSize * 2)

  // Remove match players from queue.
  const queueUpdates = {}
  queuedPlayers.forEach(id => queueUpdates[`queue.${id}`] = FieldValue.delete())
  await leagues.update({ id: league.id, ...queueUpdates })
  return queuedPlayers
}

const onUpdateQueue = async (leagueName, shouldQueue, context) => {
  let leagueId, league

  try {
    const teamSize = getTeamSize(leagueName)
    leagueId = `${context.guild.id}-${teamSize}`
    console.log('updatepls', shouldQueue, leagueId)
    debugger
    league = await updateQueue(leagueId, context.author.id, shouldQueue)
    console.log('done')

    if (!shouldQueue) {
      context.channel.send(`You have been removed from the queue.`)
      return
    }

    if (Object.keys(league.queue).length < teamSize * 2) {
      console.log('Adding player to queue.')
      context.channel.send(messages.QUEUE(league))
      return
    }

    const playerIds = await getMatchPlayers(leagueId)

    let mode = MATCH_MODE.RANDOM

    if (teamSize > 1) {
      const message = await context.channel.send(messages.GET_MATCH_MODE({ playerIds, teamSize }))
      mode = await getMatchMode({ message, playerIds })
    }

    const match = await createMatch({ leagueId, playerIds, mode, teamSize })
    await context.channel.send(messages.CREATE_MATCH(match))
  } catch (err) {
    console.log('[ERROR]', err)
    context.channel.send(err)
    return
  }
}

const onQueue = async (leagueName, context) => {
  return await onUpdateQueue(leagueName, true, context)
}

const onUnqueue = async (leagueName, context) => {
  return await onUpdateQueue(leagueName, false, context)
}

module.exports = {
  getTeamSize,
  updateQueue,
  onQueue,
  onUnqueue,
  getMatchMode
}