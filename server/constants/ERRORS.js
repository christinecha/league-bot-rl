const ERRORS = {
  INVALID_TEAM_SIZE: `Team size is invalid. Must be 1, 2, or 3 (separate with spaces if using multiple).`,
  NO_SUCH_LEAGUE: ({ teamSize }) =>
    `A ${teamSize}s league does not exist in this server. Try \`@LeagueBot new ${teamSize}\` to create it.`,

  MATCH_INVALID: 'No match with this ID exists.',
  MATCH_NO_SUCH_USER: 'User was not in the specified match.',
  MATCH_DUPLICATE_REPORT: 'This match has already been reported.',
  MATCH_CREATION_ERROR: 'Error generating new match.',
  MATCH_UNCANCELABLE: 'Cannot cancel a match that has already been reported.',

  QUEUE_NO_SUCH_USER: 'User is not in the queue.',
  QUEUE_DUPLICATE_USER: ({ userId, teamSize }) =>
    `<@!${userId}> is already in the ${teamSize}s queue.`,

  MOD_ONLY: 'You must be a LeagueBot mod to use this command.',

  NO_TEAM_SELECTED: 'No team was selected.',

  DATE_MISSING: 'Must include a date (`yyyy-mm-dd`) with this command.',
  DATE_INVALID: 'Invalid date format - use `yyyy-mm-dd`.',
  END_MUST_BE_AFTER_START:
    'End date must be after the start date. Update the start date with `@LeagueBot start <teamSize> <date>`.',
}

module.exports = ERRORS
