const { COMMAND_NAME } = require('../../shared/commands')
const { onQueue, onUnqueue, onClear } = require('./queue')
const { onReportWin, onReportLoss } = require('./report')
const messages = require('./messages')
const { onBubbles } = require('./bubbles')
const { onRoast } = require('./roast')
const { onCancel } = require('./cancel')
const { onStatus } = require('./status')
const { onMod } = require('./mod')
const { onNew } = require('./new')
const { onReset } = require('./reset')
const { onVoidMatch } = require('./void-match')
const { onFixMatch } = require('./fix-match')
const {
  onLeaderboardStart,
  onLeaderboardEnd,
  onLeaderboard,
} = require('./leaderboard')

const CALLBACKS = {
  [COMMAND_NAME.BUBBLES]: onBubbles,
  [COMMAND_NAME.CANCEL]: onCancel,
  [COMMAND_NAME.CLEAR]: onClear,
  [COMMAND_NAME.HELP]: (context) => {
    context.channel.send(messages.HELP())
  },
  [COMMAND_NAME.LEADERBOARD]: onLeaderboard,
  [COMMAND_NAME.LEADERBOARD_START]: onLeaderboardStart,
  [COMMAND_NAME.LEADERBOARD_END]: onLeaderboardEnd,
  [COMMAND_NAME.LEAVE]: onUnqueue,
  [COMMAND_NAME.LOSS]: onReportLoss,
  [COMMAND_NAME.NEW]: onNew,
  [COMMAND_NAME.QUEUE]: onQueue,
  [COMMAND_NAME.ROAST]: onRoast,
  [COMMAND_NAME.STATUS]: onStatus,
  [COMMAND_NAME.WIN]: onReportWin,
  [COMMAND_NAME.MOD]: onMod,
  [COMMAND_NAME.RESET]: onReset,
  [COMMAND_NAME.VOID_MATCH]: onVoidMatch,
  [COMMAND_NAME.FIX_MATCH]: onFixMatch,
}

module.exports = {
  CALLBACKS,
}
