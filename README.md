league
- teamSize
- id (string) <server-id>-<league-name>
- name (string)
- queue (array of players)

match
- players
  - id (string)
  - win (boolean)

--

### Commands
--
@LeagueBot status [league-name] - Show active leagues & queues
@LeagueBot join | j [league-name] - Join active queue for specified league
@LeagueBot leave | l [league-name (opt)] - Leave active queue for specified league (or all, if unspecified)
@LeagueBot leaderboard [league-name] - Show leaderboard for specified league

Once an active league queue hits (team-size * 2), create new match.

@LeagueBot report | r [match-id] [win OR lose] - Report match result. 

#### Mod-Only
@LeagueBot new [team-size: 1, 2, 3] - Create new league with specified name and team size
@LeagueBot reset [league-name] - End league with specified name
@LeagueBot delete [league-name] - Delete league with specified name (forever!)


### Scope Limitations
- Initially, there can only be one simultaneous league of each team-size.
- Initially will use 3 hard-coded `league-name`s. "1s", "2s", and "3s".