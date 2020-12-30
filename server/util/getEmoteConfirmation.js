const getEmoteConfirmation = ({
  validate,
  channel,
  message,
  emote,
  timeLimit,
}) => {
  return new Promise(async (resolve, reject) => {
    const _message = await channel.send(message)
    _message.react(emote)

    const filter = (reaction, user) => {
      if (!validate(reaction, user)) return
      resolve()
    }

    _message.awaitReactions(filter, { time: timeLimit }).then(() => {
      reject()
    })
  })
}

module.exports = {
  getEmoteConfirmation,
}
