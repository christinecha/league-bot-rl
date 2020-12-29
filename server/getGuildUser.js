const { discord } = require('./data/util/discord')

const RANK_ROLES = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Platinum: 3,
  Diamond: 5,
  Champ: 7,
  GC: 9,
  SSL: 13,
}

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
  const rankRole = roles.find((r) => RANK_ROLES[r.name])
  const rank = rankRole ? RANK_ROLES[rankRole.name] : undefined

  return {
    ...user,
    displayName: user.displayName,
    roles,
    rank,
  }
}

module.exports = { getGuildUser }
