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
      ...league.queue,
      [userId]: newValue
    }
  }

  if (!shouldQueue) delete newLeague.queue[userId]
  return newLeague
}

const onUpdateQueue = async (leagueName, shouldQueue, context) => {
  let leagueId, league

  try {
    const teamSize = getTeamSize(leagueName)
    leagueId = `${context.guild.id}-${teamSize}`
    league = await updateQueue(leagueId, context.author.id, shouldQueue)

    if (!shouldQueue) {
      context.channel.send(`You have been removed from the queue.`)
      return
    }

    if (Object.keys(league.queue).length < teamSize * 2) {
      context.channel.send(messages.QUEUE(league))
      return
    }

    const match = await createMatch(leagueId)
    context.channel.send(messages.CREATE_MATCH(match))
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
  onUnqueue
}