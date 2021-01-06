## Discord League Bot

A bot that lets you run simultaneous 1s, 2s, and 3s leagues in your Discord channel. Specifically geared toward Rocket League for now, but has the potential to be generalized.

![League Bot Discord Profile](https://www.leaguebotrl.com/assets/league-bot-profile.png)

If you'd like to help support the development and maintenance of this project, you can [become a Github Sponsor](https://github.com/sponsors/christinecha).

---

### Usage

Click [this link](https://discord.com/oauth2/authorize?client_id=775129640322203658&scope=bot) to add the bot to your Discord server, or visit www.leaguebotrl.com for more information. If you're interested in running this project locally, development instructions are below.

### Variables

- `date` - A date value formatted `yyyy-mm-dd`.
- `matchId` - The unique match ID.
- `teamSize` - 1, 2, or 3.

### Commands

- `@LeagueBot cancel <matchId>` - Cancel a match.
- `@LeagueBot clear | c <teamSize>` - Clear the queue for a specific league.
- `@LeagueBot help | h` - Show me all the commands.
- `@LeagueBot leaderboard <[teamSize]>` - Show me the leaderboard!
- `@LeagueBot leave | l <[teamSize]>` - Leave the queue for one or all leagues.
- `@LeagueBot loss | lose | lost <matchId>` - Report that you lost this match.
- `@LeagueBot new | n <teamSize>` - Start a new league for a specific team size.
- `@LeagueBot queue | q <teamSize>` - Join the queue for a specific league.
- `@LeagueBot status | s <[teamSize]>` - Show the current queue(s).
- `@LeagueBot win | won <matchId>` - Report that you won this match.

### Mod-Only Commands

- `@LeagueBot fix <matchId>` - Overwrite the results of a specific match.
- `@LeagueBot leaderboard-end | end <teamSize> <date>` - Set the end date of the leaderboard.
- `@LeagueBot leaderboard-start | start <teamSize> <date>` - Set the start date of the leaderboard.
- `@LeagueBot reset <teamSize>` - Reset the leaderboard for a specific league.
- `@LeagueBot void <matchId>` - Erase a specific match from history.

### Advanced

- Mentioning `@LeagueBot` is optional in the channel that has most recently been queued in. As a shortcut in this channel, you can use a `!` prefix instead, like `!leave 2s`, `!q 1` or `!leaderboard`

---

### Feature/Bug Backlog

- ✨ **Requeue | Rematch.** Requeue everyone from a specific match.
- ✨ **Insult/Compliment Contributions.** Add a place for people to submit bot insults & compliments.
- 🐛 **Update Discord message format.** Remove timestamps and add some bot info.
- ✨ **Recent matches.** A command that lists the most recent matches played in this server.
- ✨ **Set-Channel.** Command to manually set a channel where the ! shortcut will work. Possibly mod-only?
- 🐛 **Prune queues on match creation.** If you get a match for one league, it should remove all those players from the other leagues' queues.
- ✨ **Recently Viewed Servers.** Save leaderboard server ids in local storage so that they're easily accessible from the homepage.
- 🐛 **Cleaning queue should only kick old queuers.** If you re-queue mid-clean, for instance it should no longer kick you.
- ✨ **Set default leaderboard range.** Use messages to set the from and to values of the leaderboard range
- ✨ **View leaderboard with custom range.** Add query parameters to leaderboard page?
- ✨ **Download CSV of player data.** Allow users to download leaderboard stats from website.

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
