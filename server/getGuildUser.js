const { discord } = require('./data/util/discord')

const RANK_ROLES = {
  'Bronze': 0,
  'Silver': 1,
  'Gold': 2,
  'Platinum': 3,
  'Diamond': 5,
  'Champion': 7,
  'Grand Champion': 9,
  'Supersonic Legend': 13,
}

const getGuildUser = async ({ userId, guildId }) => {
  try {
    const guild = await discord.guilds.fetch(guildId)
    const user = await guild.members.fetch(userId)
    const roles = user.roles.cache || []
    const rankRole = roles.find(r => RANK_ROLES[r.name])
    const rank = rankRole ? RANK_ROLES[rankRole.name] : undefined

    return {
      ...user,
      displayName: user.displayName,
      roles,
      rank
    }
  } catch (err) {
    throw (err)
  }
}

module.exports = { getGuildUser }