const COMMAND_NAME = {
  QUEUE: 'QUEUE',
  STATUS: 'STATUS',
  LEAVE: 'LEAVE',
  NEW: 'NEW',
  WIN: 'WIN',
  LOSS: 'LOSS',
  LEADERBOARD: 'LEADERBOARD',
  HELP: 'HELP',
  CLEAR: 'CLEAR',
  CANCEL: 'CANCEL',
  ROAST: 'ROAST',
  BUBBLES: 'BUBBLES',
}

const COMMANDS = {
  [COMMAND_NAME.QUEUE]: {
    command: 'queue',
    aliases: ['q'],
    argument: 'league',
    description: 'Join the queue for a specific league',
  },
  [COMMAND_NAME.STATUS]: {
    command: 'status',
    aliases: ['s'],
    argument: '[league]',
    description: 'Show the current queue(s)',
  },
  [COMMAND_NAME.LEAVE]: {
    command: 'leave',
    aliases: ['l'],
    argument: '[league]',
    description: 'Leave the queue for a specific league, or all if unspecified',
  },
  [COMMAND_NAME.NEW]: {
    command: 'new',
    aliases: ['n'],
    argument: 'teamSize',
    description: 'Initialize a new league for a specific team size.',
  },
  [COMMAND_NAME.WIN]: {
    command: 'win',
    aliases: ['won'],
    argument: 'matchId',
    description: 'Report that you won this match.',
  },
  [COMMAND_NAME.LOSS]: {
    command: 'loss',
    aliases: ['lose', 'lost'],
    argument: 'matchId',
    description: 'Report that you lost this match.',
  },
  [COMMAND_NAME.LEADERBOARD]: {
    command: 'leaderboard',
    aliases: [],
    argument: '[league]',
    description: 'Show me the leaderboard!',
  },
  [COMMAND_NAME.HELP]: {
    command: 'help',
    aliases: ['h'],
    argument: '',
    description: 'Show me all the commands.',
  },
  [COMMAND_NAME.CLEAR]: {
    command: 'clear',
    aliases: ['c'],
    argument: 'league',
    description: 'Clear the queue for a specific league.',
  },
  [COMMAND_NAME.CANCEL]: {
    command: 'cancel',
    argument: 'matchId',
    description: 'Cancel a match.',
  },
  [COMMAND_NAME.ROAST]: {
    isHidden: true,
    command: 'roast',
    argument: '@user',
  },
  [COMMAND_NAME.BUBBLES]: {
    isHidden: true,
    command: 'bubbles',
  },
}

module.exports = { COMMANDS, COMMAND_NAME }
