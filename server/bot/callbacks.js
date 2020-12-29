const { COMMAND_NAME } = require('../../shared/commands')
const { onQueue, onUnqueue, onClear } = require('./queue')
const { onReportWin, onReportLoss } = require('./report')
const messages = require('./messages')
const { onBubbles } = require('./bubbles')
const { onRoast } = require('./roast')
const { onCancel } = require('./cancel')
const { onStatus } = require('./status')
const { onNew } = require('./new')

const CALLBACKS = {
  [COMMAND_NAME.BUBBLES]: onBubbles,
  [COMMAND_NAME.CANCEL]: onCancel,
  [COMMAND_NAME.CLEAR]: onClear,
  [COMMAND_NAME.HELP]: (_, context) => {
    context.channel.send(messages.HELP())
  },
  [COMMAND_NAME.LEADERBOARD]: (teamSize, context) => {
    context.channel.send(
      `https://www.leaguebotrl.com/?guildId=${context.guild.id}${
        teamSize ? `&teamSize=${teamSize}` : ''
      }`
    )
  },
  [COMMAND_NAME.LEAVE]: onUnqueue,
  [COMMAND_NAME.LOSS]: onReportLoss,
  [COMMAND_NAME.NEW]: onNew,
  [COMMAND_NAME.QUEUE]: onQueue,
  [COMMAND_NAME.ROAST]: onRoast,
  [COMMAND_NAME.STATUS]: onStatus,
  [COMMAND_NAME.WIN]: onReportWin,
}

module.exports = {
  CALLBACKS,
}
