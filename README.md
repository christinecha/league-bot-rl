## Discord League Bot
A bot that lets you run simultaneous 1s, 2s, and 3s leagues in your Discord channel.

[WORK IN PROGRESS]

---

### Definitions
- `league-name`: currently either "1s", "2s", or "3s"

### Public Commands
- `@LeagueBot status [league-name]` - Show active leagues & queues
- `@LeagueBot join | j [league-name]` - Join active queue for specified league
- `@LeagueBot leave | l [league-name (opt)]` - Leave active queue for specified league (or all, if unspecified)
- `@LeagueBot leaderboard [league-name]` - Show leaderboard for specified league
- `@LeagueBot win | won [match-id]` - Report match result as a win for your team! 
- `@LeagueBot lose | loss | lost [match-id]` - Report match result as a win for your team! 

### Mod-Only Commands
- `@LeagueBot new [league-name]` - Create new league with specified name and team size
- `@LeagueBot reset [league-name]` - End league with specified name
- `@LeagueBot delete [league-name]` - Delete league with specified name (forever!)


### Scope Limitations
- Initially, there can only be one simultaneous league of each team-size.
- Initially will use 3 hard-coded `league-name`s. "1s", "2s", and "3s".


#### Random Notes
TODO:
- Requeue: Add everyone who was in the last match back to the queue
- ~Add a hint to the default responder~
- ~Add a roast command to the bot~
- Add a place for people to submit insults/compliments, etc.
- Why are tests so slow when streaming???
- fix tests to use actual discord messages
- Cancel match
- ~"You there?" feature~
- Get rid of the silly dates! It's duplicated
- ~If channel Id, don't require @leaguebot~
- @leaguebot reset
- if wrong channel, provide a hint & way to set! (set-channel)
- ~!bubbles - qs for 1,2,3 - does not leave until you manually do it~
- ~make 4s league~
- If you get a match for another playlist, it should remove you from other lists
