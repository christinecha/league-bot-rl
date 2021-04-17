const RL_RANKS = require('../constants/RL_RANKS')
const { scoreUser } = require('../util/balanceTeams')
const { getGuildUser } = require('../util/getGuildUser')
const { getLeagueStats } = require('../util/getLeagueStats')

const onStats = async (context, userStr, teamSize) => {
  const matches = userStr.match(/<[@|!]*(\d*)>/)
  const userId = matches[1]
  console.log(userId, teamSize)

  const guildId = context.guild.id
  const leagueId = `${guildId}-${teamSize}`
  const stats = await getLeagueStats(leagueId)
  const guildUser = await getGuildUser({ userId, guildId })
  console.log(guildUser, stats)

  const rawStats = stats[userId]
  const matchesPlayed = (rawStats.win || 0) + (rawStats.loss || 0)

  const user = {
    id: userId,
    name: guildUser.displayName,
    matchesPlayed,
    win: rawStats.win,
    loss: rawStats.loss,
    points: rawStats.points,
    ratio: stats[userId] ? stats[userId].ratio : 0.5,
    rank: guildUser.rank || RL_RANKS.Champ,
    rankName: Object.keys(RL_RANKS).find((k) => guildUser.rank === k) || null,
  }

  const userStats = {
    ...user,
    score: scoreUser(user),
  }

  context.channel.send(JSON.stringify(userStats, null, 2))
}

module.exports = { onStats }
