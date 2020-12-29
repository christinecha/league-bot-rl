const { discord } = require('../data/util/discord')
const RL_RANKS = require('../constants/RL_RANKS')

const getGuildUser = async ({ userId, guildId }) => {
  let user = {
    id: userId,
    roles: {},
  }

  try {
    const guild = await discord.guilds.fetch(guildId)
    const res = await guild.members.fetch(userId)

    user = {
      ...res.user,
      avatarURL: res.user.avatarURL(),
      roles: res.roles,
    }
  } catch (err) {
    console.log('ERROR: Could not get guild user:', err)
  }

  const roles = user.roles.cache || []
  const rankRole = roles.find(r => RL_RANKS[r.name])
  const rank = rankRole ? RL_RANKS[rankRole.name] : undefined

  return {
    ...user,
    displayName: user.displayName,
    roles,
    rank,
  }
}

module.exports = { getGuildUser }
