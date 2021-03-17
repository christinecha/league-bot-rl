const guilds = require('../data/guilds')
const { PREFIX_UPDATED } = require('./messages')

const onPrefix = async (context, str = '') => {
  const prefix = str.trim()

  if (prefix.length !== 1) {
    context.channel.send('Prefix must be exactly one character.')
    return
  }

  await guilds.update({
    id: context.guild.id,
    prefix,
  })

  context.channel.send(PREFIX_UPDATED({ prefix }))

  console.log(prefix)
}

module.exports = { onPrefix }
