const leagues = require('../data/leagues')
const createMatch = require('./createMatch')
const messages = require('./messages')
const ERRORS = require('../constants/ERRORS')
const TEAM_SIZES = require('../constants/TEAM_SIZES')
const { admin } = require('../data/util/firebase')
const { getTeamSize } = require('../util')
const FieldValue = admin.firestore.FieldValue

const updateQueue = async (context, league, shouldQueue) => {
  const userId = context.author.id
  const queue = league.queue || {}

  if (shouldQueue && queue[userId])
    throw ERRORS.QUEUE_DUPLICATE_USER({ userId, teamSize: league.teamSize })
  if (!shouldQueue && !queue[userId]) throw ERRORS.QUEUE_NO_SUCH_USER

  const newValue = shouldQueue ? Date.now() : FieldValue.delete()
  const queueUpdate = { [`queue.${userId}`]: newValue }
  const doNotKickUpdate = !shouldQueue ? { [`doNotKick.${userId}`]: false } : {}
  await leagues.update({
    id: league.id,
    ...queueUpdate,
    channelId: context.channel.id,
    ...doNotKickUpdate,
  })
}

const MATCH_MODE = {
  AUTO: 'auto',
  RANDOM: 'random',
}

const MODE_EMOTE = {
  '🤖': MATCH_MODE.AUTO,
  '👻': MATCH_MODE.RANDOM,
}

const getMatchMode = async ({ message, playerIds }) => {
  return new Promise((resolve, reject) => {
    message.react('🤖')
    message.react('👻')

    const modes = {
      [MATCH_MODE.AUTO]: 0,
      [MATCH_MODE.RANDOM]: 0,
    }

    const filter = (reaction, user) => {
      if (!playerIds.includes(user.id)) return

      const selected = MODE_EMOTE[reaction.emoji.name]
      if (selected) modes[selected] += 1

      const official = Object.keys(modes).find(
        (k) => modes[k] >= playerIds.length * 0.5
      )
      if (!official) return

      resolve(official)
    }

    const twoMinutes = 1000 * 60 * 2
    message.awaitReactions(filter, { time: twoMinutes }).then(() => {
      if (modes[MATCH_MODE.AUTO] >= modes[MATCH_MODE.RANDOM])
        resolve(MATCH_MODE.AUTO)
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
  queuedPlayers.forEach(
    (id) => (queueUpdates[`queue.${id}`] = FieldValue.delete())
  )
  await leagues.update({ id: league.id, ...queueUpdates })
  return queuedPlayers
}

const onUpdateQueue = async (context, leagueStrs, shouldQueue) => {
  let leagueId
  let teamSizes = []

  if (!leagueStrs.length) {
    teamSizes = TEAM_SIZES
  } else {
    teamSizes = leagueStrs
      .map((str) => getTeamSize(str, false))
      .filter((s) => !!s)
  }

  console.log('hello', teamSizes)

  if (!teamSizes.length) {
    await context.channel.send(ERRORS.INVALID_TEAM_SIZE)
    return
  }

  for (let teamSize of teamSizes) {
    try {
      leagueId = `${context.guild.id}-${teamSize}`
      let league = await leagues.get(leagueId)

      if (!league) {
        throw ERRORS.NO_SUCH_LEAGUE({ teamSize })
      }

      await updateQueue(context, league, shouldQueue)
      league = await leagues.get(leagueId)

      if (!shouldQueue) {
        await context.channel.send(
          messages.LEAVE_QUEUE({ userId: context.author.id, teamSize })
        )
        continue
      }

      if (Object.keys(league.queue).length < teamSize * 2) {
        console.log('Adding player to queue.')
        await context.channel.send(messages.QUEUE(league))
        continue
      }

      const playerIds = await getMatchPlayers(leagueId)

      let mode = MATCH_MODE.RANDOM

      if (teamSize > 1) {
        const message = await context.channel.send(
          messages.GET_MATCH_MODE({ playerIds, teamSize })
        )
        mode = await getMatchMode({ message, playerIds })
      }

      const match = await createMatch({ leagueId, playerIds, mode, teamSize })
      await context.channel.send(messages.MATCH_DETAILS(match))
    } catch (err) {
      console.log('[ERROR]', err)
      await context.channel.send(err)
    }
  }
}

const onQueue = async (context, ...leagueStrs) => {
  return await onUpdateQueue(context, leagueStrs, true)
}

const onUnqueue = async (context, ...leagueStrs) => {
  return await onUpdateQueue(context, leagueStrs, false)
}

const onClear = async (context, leagueName) => {
  try {
    const teamSize = getTeamSize(leagueName)
    const leagueId = `${context.guild.id}-${teamSize}`
    await leagues.update({ id: leagueId, queue: {} })
    await context.channel.send(`${teamSize}s queue has been cleared.`)
  } catch (err) {
    console.log('[ERROR]', err)
    await context.channel.send(err)
    return
  }
}

module.exports = {
  getTeamSize,
  updateQueue,
  onQueue,
  onUnqueue,
  onClear,
}
