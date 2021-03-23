const leagues = require('../data/leagues')
const createMatch = require('./createMatch')
const messages = require('./messages')
const ERRORS = require('../constants/ERRORS')
const TEAM_SIZES = require('../constants/TEAM_SIZES')
const { admin } = require('../data/util/firebase')
const { getTeamSize } = require('../util')
const { ReactionVoter } = require('../util/ReactionVoter')
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
  CANCEL: 'cancel',
}

const MODE_EMOTE = {
  '🤖': MATCH_MODE.AUTO,
  '👻': MATCH_MODE.RANDOM,
  '🚫': MATCH_MODE.CANCEL,
}

const getMatchMode = async ({ message, playerIds }) => {
  return new Promise((resolve, reject) => {
    message.react('🤖')
    message.react('👻')
    message.react('🚫')

    const reactionVoter = new ReactionVoter()

    const filter = (reaction, user) => {
      if (!playerIds.includes(user.id)) return

      const selection = MODE_EMOTE[reaction.emoji.name]
      if (selection) {
        reactionVoter.recordVote({ userId: user.id, selection })
      }

      const winner = reactionVoter.getWinner({ minVotes: playerIds.length / 2 })
      if (!winner) return
      resolve(winner)
    }

    const twoMinutes = 1000 * 60 * 2
    message.awaitReactions(filter, { time: twoMinutes }).then(() => {
      const mostPopular = reactionVoter.getWinner() || MATCH_MODE.RANDOM
      resolve(mostPopular)
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
  let leagueId, ignoreErrors
  let teamSizes = []
  const leaguesAffected = []
  let count = 0
  const userId = context.author.id

  if (!leagueStrs.length || leagueStrs[0].toLowerCase() === 'all') {
    ignoreErrors = true
    teamSizes = TEAM_SIZES
  } else {
    teamSizes = leagueStrs
      .map((str) => getTeamSize(str, false))
      .filter((s) => !!s)
  }

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
      count += 1
      league = await leagues.get(leagueId)

      if (!shouldQueue) {
        leaguesAffected.push(league)
        continue
      }

      if (Object.keys(league.queue).length < teamSize * 2) {
        leaguesAffected.push(league)
        continue
      }

      const playerIds = await getMatchPlayers(leagueId)

      let mode = MATCH_MODE.RANDOM

      if (teamSize > 1) {
        const message = await context.channel.send(
          messages.GET_MATCH_MODE({ playerIds, teamSize })
        )

        mode = await getMatchMode({ message, playerIds })

        if (mode === MATCH_MODE.CANCEL) {
          await context.channel.send(`${teamSizes}s match has been canceled.`)
          return
        }
      }

      const match = await createMatch({ leagueId, playerIds, mode, teamSize })
      await context.channel.send(messages.MATCH_DETAILS(match))
    } catch (err) {
      if (!ignoreErrors) {
        console.log('[LOGGED ERROR]', err)
        await context.channel.send(err)
      } else {
        console.log('[SILENT ERROR]', err)
      }
    }
  }

  if (leaguesAffected.length) {
    await context.channel.send(
      messages.STATUS_MULTIPLE({ leagues: leaguesAffected })
    )
  }

  if (count < 1 && ignoreErrors && !shouldQueue) {
    await context.channel.send(ERRORS.QUEUE_NOT_IN_ANY({ userId }))
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
