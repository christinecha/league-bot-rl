const getRandom = (arr) => {
  const rand = Math.floor(Math.random() * arr.length)
  return arr[rand]
}

const getInsult = ({ userId }) => {
  const insults = [
    `Was <@!${userId}> auditioning for Hamlet? Because that was one tragic performance.`,
    `<@!${userId}> - remember: ball goes in the other team's net.`,
    `<@!${userId}> bot confirmed??`,
    `Some questionable shots there, <@!${userId}>.`,
    `Did you forget to turn your monitor on, <@!${userId}>?`,
    `You're not supposed to fake *every* ball, <@!${userId}>.`,
    `<@!${userId}> is definitely mafia.`,
  ]

  return getRandom(insults)
}

const onRoast = (userStr, context) => {
  const matches = userStr.match(/<[@|!]*(\d*)>/)
  const userId = matches[1]

  context.channel.send(getInsult({ userId }))
}

module.exports = { onRoast }