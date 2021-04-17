const COMMAND_NAME = {
  QUEUE: 'QUEUE',
  STATUS: 'STATUS',
  LEAVE: 'LEAVE',
  NEW: 'NEW',
  WIN: 'WIN',
  LOSS: 'LOSS',
  LEADERBOARD: 'LEADERBOARD',
  LEADERBOARD_START: 'LEADERBOARD_START',
  LEADERBOARD_END: 'LEADERBOARD_END',
  LEADERBOARD_START_ALL: 'LEADERBOARD_START_ALL',
  LEADERBOARD_END_ALL: 'LEADERBOARD_END_ALL',
  HELP: 'HELP',
  CLEAR: 'CLEAR',
  CANCEL: 'CANCEL',
  ROAST: 'ROAST',
  BUBBLES: 'BUBBLES',
  MOD: 'MOD',
  REPORT: 'REPORT',
  RESET: 'RESET',
  VOID_MATCH: 'VOID_MATCH',
  FIX_MATCH: 'FIX_MATCH',
  PREFIX: 'PREFIX',
  STATS: 'STATS',
  TEST: 'TEST',
}

const VARIABLE_NAME = {
  TEAM_SIZE: 'teamSize',
  MATCH_ID: 'matchId',
  USER: '@user',
  DATE: 'date',
  PREFIX: 'prefix',
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
  [VARIABLE_NAME.DATE]: {
    name: 'date',
    description: 'A date value formatted `yyyy-mm-dd`.',
  },
  [VARIABLE_NAME.PREFIX]: {
    name: 'prefix',
    description:
      'A prefix to go in front of League Bot commands. The default is `!`, ex. `!queue`. No spaces allowed.',
  },
}

const optional = (v) => `[${v}]`

const COMMANDS = {
  [COMMAND_NAME.QUEUE]: {
    command: 'queue',
    aliases: ['q'],
    args: [VARIABLE_NAME.TEAM_SIZE],
    description: 'Join the queue for a specific league.',
  },
  [COMMAND_NAME.STATUS]: {
    command: 'status',
    aliases: ['s'],
    args: [optional(VARIABLE_NAME.TEAM_SIZE)],
    description: 'Show the current queue(s).',
  },
  [COMMAND_NAME.LEAVE]: {
    command: 'leave',
    aliases: ['l'],
    args: [optional(VARIABLE_NAME.TEAM_SIZE)],
    description: 'Leave the queue for one or all leagues.',
  },
  [COMMAND_NAME.NEW]: {
    command: 'new',
    aliases: ['n'],
    args: [VARIABLE_NAME.TEAM_SIZE],
    description: 'Start a new league for a specific team size.',
  },
  [COMMAND_NAME.WIN]: {
    command: 'win',
    aliases: ['won', 'w'],
    args: [VARIABLE_NAME.MATCH_ID],
    description: 'Report that you won this match.',
  },
  [COMMAND_NAME.LOSS]: {
    command: 'loss',
    aliases: ['lose', 'lost'],
    args: [VARIABLE_NAME.MATCH_ID],
    description: 'Report that you lost this match.',
  },
  [COMMAND_NAME.LEADERBOARD]: {
    command: 'leaderboard',
    aliases: [],
    args: [optional(VARIABLE_NAME.TEAM_SIZE)],
    description: 'Show me the leaderboard!',
  },
  [COMMAND_NAME.LEADERBOARD_START]: {
    command: 'start',
    modOnly: true,
    args: [VARIABLE_NAME.TEAM_SIZE, VARIABLE_NAME.DATE],
    description: 'Set the start date of the leaderboard.',
  },
  [COMMAND_NAME.LEADERBOARD_END]: {
    command: 'end',
    modOnly: true,
    args: [VARIABLE_NAME.TEAM_SIZE, VARIABLE_NAME.DATE],
    description: 'Set the end date of the leaderboard.',
  },
  [COMMAND_NAME.LEADERBOARD_START_ALL]: {
    command: 'start-all',
    modOnly: true,
    args: [VARIABLE_NAME.DATE],
    description: 'Set the start date of the leaderboard.',
  },
  [COMMAND_NAME.LEADERBOARD_END_ALL]: {
    command: 'end-all',
    modOnly: true,
    args: [VARIABLE_NAME.DATE],
    description: 'Set the end date of the leaderboard.',
  },
  [COMMAND_NAME.HELP]: {
    command: 'help',
    aliases: ['h'],
    args: [],
    description: 'Show me all the commands.',
  },
  [COMMAND_NAME.CLEAR]: {
    command: 'clear',
    aliases: ['c'],
    args: [VARIABLE_NAME.TEAM_SIZE],
    description: 'Clear the queue for a specific league.',
  },
  [COMMAND_NAME.CANCEL]: {
    command: 'cancel',
    args: [VARIABLE_NAME.MATCH_ID],
    description: 'Cancel a match.',
  },

  /* MOD-ONLY COMMANDS */
  [COMMAND_NAME.RESET]: {
    command: 'reset',
    modOnly: true,
    args: [VARIABLE_NAME.TEAM_SIZE],
    description: 'Reset the start of the leaderboard to *right now*.',
  },
  [COMMAND_NAME.MOD]: {
    command: 'mod',
    isHidden: true,
    modOnly: true,
    args: [VARIABLE_NAME.USER],
    description: 'Give a user mod access to LeagueBot.',
  },
  [COMMAND_NAME.VOID_MATCH]: {
    command: 'void',
    modOnly: true,
    args: [VARIABLE_NAME.MATCH_ID],
    description: 'Erase a specific match from history.',
  },
  [COMMAND_NAME.FIX_MATCH]: {
    command: 'fix',
    modOnly: true,
    args: [VARIABLE_NAME.MATCH_ID],
    description: 'Overwrite the results of a specific match.',
  },
  [COMMAND_NAME.PREFIX]: {
    command: 'prefix',
    modOnly: true,
    args: [VARIABLE_NAME.PREFIX],
    description:
      'Change the command prefix for @LeagueBot to recognize. The default is `!`.',
  },

  /* HIDDEN COMMANDS */
  [COMMAND_NAME.ROAST]: {
    isHidden: true,
    command: 'roast',
    args: [VARIABLE_NAME.USER],
  },
  [COMMAND_NAME.BUBBLES]: {
    isHidden: true,
    command: 'bubbles',
    args: [],
  },
  [COMMAND_NAME.REPORT]: {
    isHidden: true,
    command: 'report',
    args: [],
  },
  [COMMAND_NAME.TEST]: {
    isHidden: true,
    command: 'test',
    args: [],
  },
  [COMMAND_NAME.STATS]: {
    isHidden: true,
    command: 'stats',
    args: [VARIABLE_NAME.USER],
  },
}

module.exports = { COMMANDS, COMMAND_NAME, VARIABLES, VARIABLE_NAME }
