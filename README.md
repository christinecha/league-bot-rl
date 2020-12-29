## Discord League Bot

A bot that lets you run simultaneous 1s, 2s, and 3s leagues in your Discord channel. Specifically geared toward Rocket League for now, but has the potential to be generalized.

![League Bot Discord Profile](https://www.leaguebotrl.com/assets/league-bot-profile.png)

---

### Usage

Click [this link](https://discord.com/oauth2/authorize?client_id=775129640322203658&scope=bot) to add the bot to your Discord server, or visit www.leaguebotrl.com for more information. If you're interested in running this project locally, development instructions are below.

### Commands

- `@LeagueBot cancel <matchId>` - Cancel a match.
- `@LeagueBot clear | c <league>` - Clear the queue for a specific league.
- `@LeagueBot help | h` - Show me all the commands.
- `@LeagueBot leaderboard <[league]>` - Show me the leaderboard!
- `@LeagueBot leave | l <[league]>` - Leave the queue for a specific league, or all if unspecified
- `@LeagueBot loss | lose | lost <matchId>` - Report that you lost this match.
- `@LeagueBot new | n <teamSize>` - Initialize a new league for a specific team size.
- `@LeagueBot queue | q <league>` - Join the queue for a specific league
- `@LeagueBot status | s <[league]>` - Show the current queue(s)
- `@LeagueBot win | won <matchId>` - Report that you won this match.

### Variables

- `league`: currently either "1s", "2s", or "3s"

### Mod-Only Commands

- `@LeagueBot new [league-name]` - Create new league with specified name and team size
- `@LeagueBot reset [league-name]` - End league with specified name
- `@LeagueBot delete [league-name]` - Delete league with specified name (forever!)

### Scope Limitations

- Initially, there can only be one simultaneous league of each team-size.
- Initially will use 3 hard-coded `league-name`s. "1s", "2s", and "3s".

### Feature/Bug Backlog

- ✨ **Requeue | Rematch.** Requeue everyone from a specific match.
- ✨ **Insult/Compliment Contributions.** Add a place for people to submit bot insults & compliments.
- 🐛 **Update Discord message format.** Remove timestamps, update the color, and add some bot info.
- ✨ **Reset.** A command to reset a leaderboard. Should be mod-only.
- ✨ **Mod-Only Commands.** Designate some commands to be mod-only.
- ✨ **Set-Channel.** Command to manually set a channel where the ! shortcut will work. Possibly mod-only?
- 🐛 **Prune queues on match creation.** If you get a match for one league, it should remove all those players from the other leagues' queues.

### Development

1. Open up `example.env`. You need to fill in these secret values for this repo to run.
2. Create a Firebase project that uses Firestore. Then, follow [this link](https://firebase.google.com/docs/admin/setup#initialize-sdk) for instructions on generating a **private key file** for your service account. This will contain all the Firebase values you need.
3. [Create a Discord bot.](https://discord.com/developers/applications) This link will require you to log in. Then you can create a new application and create a Bot for it. The `BOT_ID` is the application's client id (under General Information) and the `BOT_TOKEN` is just called Token (on the Bot page).
4. Follow the instructions in the `example.env` file to update & rename it to `.env`.
5. Finally for the fun stuff! Let's run the server locally:

```
yarn install

# DEV MODE
yarn run dev
open http://localhost:4242 (client app)

# PRODUCTION MODE
yarn run build && yarn start

```

6. To run tests locally, you'll need to [install Firebase Emulators](https://firebase.google.com/docs/rules/emulator-setup). Then:

```
# In one window
firebase emulators:start

# In another window
yarn run test
```
