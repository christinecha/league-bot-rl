const RL_RANKS = require('../constants/RL_RANKS')
const { getGuildUser } = require('./getGuildUser')
const { getLeagueStats } = require('./getLeagueStats')

const scoreUser = ({ win, loss, rank = RL_RANKS.Champ, ratio }) => {
  const matchesPlayed = (win || 0) + (loss || 0)
  const rankRatio = rank / RL_RANKS['SSL']
  const winRatio = matchesPlayed > 6 ? ratio : 0.5
  /* 2:1 importance on rank:win */
  return rankRatio * 0.66 + winRatio * 0.34
}

const scoreTeam = (arr) => arr.reduce((s, user) => s + scoreUser(user), 0)

const balanceTeams = async ({ leagueId, userIds }) => {
  if (userIds.length % 2 !== 0) {
    throw 'Uneven number of players.'
  }

  const guildId = leagueId.split('-')[0]
  const stats = await getLeagueStats(leagueId)
  const _users = await Promise.all(
    userIds.map((id) => getGuildUser({ userId: id, guildId }))
  )

  const users = _users.map((u) => {
    const rawStats = stats[u.id] || { ratio: 0.5 }

    return {
      win: rawStats.win,
      loss: rawStats.loss,
      id: u.id,
      ratio: rawStats.ratio,
      rank: u.rank || RL_RANKS.Champ,
    }
  })

  // Order from highest to lowest score
  const ordered = users.sort((a, b) => scoreUser(a) - scoreUser(b))
  const teams = { 1: [], 2: [] }
  let left = ordered.slice()

  while (left.length >= 4) {
    const best = left[left.length - 1]
    const secondBest = left[left.length - 2]
    const worst = left[0]
    const secondWorst = left[1]

    left.splice(0, 2)
    left.splice(left.length - 2, 2)

    teams[1].push(best)
    teams[1].push(worst)
    teams[2].push(secondBest)
    teams[2].push(secondWorst)
  }

  if (left.length) {
    const worseTeam = scoreTeam(teams[1]) < scoreTeam(teams[2]) ? 1 : 2
    const betterTeam = worseTeam === 1 ? 2 : 1
    teams[betterTeam].push(left[0])
    teams[worseTeam].push(left[1])
  }

  return {
    1: teams[1].map((p) => p.id).sort(),
    2: teams[2].map((p) => p.id).sort(),
  }
}

module.exports = { balanceTeams, scoreUser }
