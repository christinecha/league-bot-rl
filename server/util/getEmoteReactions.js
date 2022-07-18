const { sendChannelMessage } = require(".")

const getEmoteReactions = ({
  validate,
  channel,
  message,
  initialEmotes = [],
  minReactions = 1,
  maxTime = 1000 * 60 * 2,
}) => {
  return new Promise(async (resolve, reject) => {
    const reactions = []
    const _message = await sendChannelMessage(channel, message)

    for (let emote of initialEmotes) {
      _message.react(emote)
    }

    const filter = (reaction, user) => {
      if (!validate(reaction, user)) return

      reactions.push({ reaction, user })
      if (reactions.length === minReactions) {
        resolve(reactions)
      }
    }

    _message.awaitReactions({ filter, time: maxTime }).then(() => {
      resolve(reactions)
    })
  })
}

module.exports = {
  getEmoteReactions,
}
