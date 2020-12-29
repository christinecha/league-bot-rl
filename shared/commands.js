const COMMANDS = {
  QUEUE: {
    command: 'queue',
    aliases: ['q'],
    argument: 'league',
    description: 'Join the queue for a specific league',
  },
  STATUS: {
    command: 'status',
    aliases: ['s'],
    argument: '[league]',
    description: 'Show the current queue(s)',
  },
  LEAVE: {
    command: 'leave',
    aliases: ['l'],
    argument: '[league]',
    description: 'Leave the queue for a specific league, or all if unspecified',
  },
  NEW: {
    command: 'new',
    aliases: ['n'],
    argument: 'teamSize',
    description: 'Initialize a new league for a specific team size.',
  },
  WIN: {
    command: 'win',
    aliases: ['won'],
    argument: 'matchId',
    description: 'Report that you won this match.',
  },
  LOSS: {
    command: 'loss',
    aliases: ['lose', 'lost'],
    argument: 'matchId',
    description: 'Report that you lost this match.',
  },
  LEADERBOARD: {
    command: 'leaderboard',
    aliases: [],
    argument: '[league]',
    description: 'Show me the leaderboard!',
  },
  HELP: {
    command: 'help',
    aliases: ['h'],
    argument: '',
    description: 'Show me all the commands.',
  },
  CLEAR: {
    command: 'clear',
    aliases: ['c'],
    argument: 'league',
    description: 'Clear the queue for a specific league.',
  },
}

module.exports = { COMMANDS }
