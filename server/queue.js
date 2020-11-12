const leagues = require('./data/leagues')
const createMatch = require('./createMatch')
const messages = require('./messages')
const ERRORS = require('./constants/ERRORS')
const { admin } = require('./data/util/firebase')
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
  return {
    ...league,
    queue: {
      ...league.queue,
      [userId]: newValue
    }
  }
}

const onUpdateQueue = async (leagueName, shouldQueue, context) => {
  let leagueId, league

  try {
    leagueId = `${context.guild.id}-${getTeamSize(leagueName)}`
    league = await updateQueue(leagueId, context.author.id, shouldQueue)
  } catch (err) {
    console.log('err', err)
    context.channel.send(err)
    return
  }

  context.channel.send(
    shouldQueue
      ? `You have been added to the queue.`
      : `You have been removed from the queue.`
  )

  if (!shouldQueue) return

  const queueLength = Object.keys(league.queue).length

  if (queueLength >= teamSize * 2) {
    context.channel.send(`Creating new match...`)
    const match = await createMatch(leagueId)
    context.channel.send(messages.CREATE_MATCH(match))
  }
}

const onQueue = async (leagueName, context) => {
  return await onUpdateQueue(leagueName, true, context)
}

const onUnqueue = async (leagueName, context) => {
  return await onUpdateQueue(leagueName, false, context)
}

module.exports = {
  updateQueue,
  onQueue,
  onUnqueue
}