const guilds = require('../data/guilds')
const { admin } = require('../data/util/firebase')
const FieldValue = admin.firestore.FieldValue

const onMod = async (context, str) => {
  const matches = str.match(/<[@|!]*(\d*)>/)
  const userId = matches[1]

  const guildMember = await context.guild.members.fetch(userId)
  const isAdmin = guildMember.hasPermission(['ADMINISTRATOR'])

  if (isAdmin) {
    await context.channel.send({
      content:
        'Server admins have mod access to LeagueBot by default.'
    })
    return
  }

  await guilds.update({ id: context.guild.id, [`mods.${userId}`]: true })
  await context.channel.send({
    content:
      `<@!${userId}> can now use League Bot mod commands in this server.`
  })
}

const onUnmod = async (context, str) => {
  const matches = str.match(/<[@|!]*(\d*)>/)
  const userId = matches[1]

  const guildMember = await context.guild.members.fetch(userId)
  const isAdmin = guildMember.hasPermission(['ADMINISTRATOR'])

  if (isAdmin) {
    await context.channel.send({
      content:
        'Server admins have mod access to LeagueBot by default.'
    })
    return
  }

  await guilds.update({
    id: context.guild.id,
    [`mods.${userId}`]: FieldValue.delete(),
  })
  await context.channel.send({
    content:
      `<@!${userId}> can no longer use League Bot mod commands in this server.`
  })
}

module.exports = { onMod, onUnmod }
