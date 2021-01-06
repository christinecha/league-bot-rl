const { getInsult } = require('../util/getCommentary')

const onRoast = (context, userStr) => {
  const matches = userStr.match(/<[@|!]*(\d*)>/)
  const userId = matches[1]

  context.channel.send(getInsult({ userId }))
}

module.exports = { onRoast }
