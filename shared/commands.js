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

const VARIABLE_NAME = {
  TEAM_SIZE: 'teamSize',
  MATCH_ID: 'matchId',
  USER: '@user',
}

const VARIABLES = {
  [VARIABLE_NAME.TEAM_SIZE]: {
    name: 'teamSize',
    description: '1, 2, or 3.',
  },
  [VARIABLE_NAME.MATCH_ID]: {
    name: 'matchId',
    description: 'The unique match ID.',
  },
  [VARIABLE_NAME.USER]: {
    name: '@user',
    isHidden: true,
    description: 'An @-mentioned user.',
  },
}

const optional = (v) => `[${v}]`

const COMMANDS = {
  [COMMAND_NAME.QUEUE]: {
    command: 'queue',
    aliases: ['q'],
    argument: VARIABLE_NAME.TEAM_SIZE,
    description: 'Join the queue for a specific league.',
  },
  [COMMAND_NAME.STATUS]: {
    command: 'status',
    aliases: ['s'],
    argument: optional(VARIABLE_NAME.TEAM_SIZE),
    description: 'Show the current queue(s).',
  },
  [COMMAND_NAME.LEAVE]: {
    command: 'leave',
    aliases: ['l'],
    argument: optional(VARIABLE_NAME.TEAM_SIZE),
    description: 'Leave the queue for one or all leagues.',
  },
  [COMMAND_NAME.NEW]: {
    command: 'new',
    aliases: ['n'],
    argument: VARIABLE_NAME.TEAM_SIZE,
    description: 'Start a new league for a specific team size.',
  },
  [COMMAND_NAME.WIN]: {
    command: 'win',
    aliases: ['won'],
    argument: VARIABLE_NAME.MATCH_ID,
    description: 'Report that you won this match.',
  },
  [COMMAND_NAME.LOSS]: {
    command: 'loss',
    aliases: ['lose', 'lost'],
    argument: VARIABLE_NAME.MATCH_ID,
    description: 'Report that you lost this match.',
  },
  [COMMAND_NAME.LEADERBOARD]: {
    command: 'leaderboard',
    aliases: [],
    argument: optional(VARIABLE_NAME.TEAM_SIZE),
    description: 'Show me the leaderboard!',
  },
  [COMMAND_NAME.HELP]: {
    command: 'help',
    aliases: ['h'],
    description: 'Show me all the commands.',
  },
  [COMMAND_NAME.CLEAR]: {
    command: 'clear',
    aliases: ['c'],
    argument: VARIABLE_NAME.TEAM_SIZE,
    description: 'Clear the queue for a specific league.',
  },
  [COMMAND_NAME.CANCEL]: {
    command: 'cancel',
    argument: VARIABLE_NAME.MATCH_ID,
    description: 'Cancel a match.',
  },
  [COMMAND_NAME.ROAST]: {
    isHidden: true,
    command: 'roast',
    argument: VARIABLE_NAME.USER,
  },
  [COMMAND_NAME.BUBBLES]: {
    isHidden: true,
    command: 'bubbles',
  },
}

module.exports = { COMMANDS, COMMAND_NAME, VARIABLES, VARIABLE_NAME }
