// Start mock server!
require("./index");
const firebase = require("@firebase/rules-unit-testing");
const leagues = require("../data/leagues");
const matches = require("../data/matches");
const { discord } = require("../data/util/discord");
const ERRORS = require("./constants/ERRORS");
const { league1s, league2s, league3s } = require("../../test/league");
const { getLeagueStats } = require("../getLeagueStats");
const { getGuildUser } = require("../getGuildUser");
const BOT_ID = process.env.BOT_ID;

const getQueueMessage = (regex) => {
  return expect.objectContaining({
    fields: [
      expect.objectContaining({
        value: expect.stringMatching(regex),
      }),
    ],
  });
};

const getMatchMessage = ({ id, team1, team2 }) => {
  return expect.objectContaining({
    description: `Match ID: ${id}`,
    fields: [
      {
        name: "Team 1",
        value: team1.map((t) => `<@!${t}>`).join(" "),
      },
      {
        name: "Team 2",
        value: team2.map((t) => `<@!${t}>`).join(" "),
      },
    ],
  });
};

let send, msg, react;

beforeAll(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  });

  done();
});

beforeEach(async (done) => {
  react = jest.fn();
  send = jest.fn(() =>
    Promise.resolve({
      react,
      awaitReactions: () => Promise.resolve(),
    })
  );
  msg = (userId, content) => ({
    content,
    author: { id: userId },
    guild: { id: "h000" },
    channel: { send },
  });

  await leagues.create(league1s);
  await leagues.create(league2s);
  await leagues.create(league3s);
  done();
});

afterEach(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  });
  done();
});

test("@LeagueBot queue <league>", async (done) => {
  const user1 = "cha";

  const before = Date.now();
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> queue 1s`));
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> queue 3s`));
  const after = Date.now();

  let league1 = await leagues.get(league1s.id);
  let league2 = await leagues.get(league2s.id);
  let league3 = await leagues.get(league3s.id);

  const allLeagues = [league1, league2, league3];

  // The correct user is queued, at an accurate time
  allLeagues.forEach((league, i) => {
    expect(Object.keys(league.queue)).toMatchSnapshot();
    expect(league.queue[user1]).toBeLessThanOrEqual(after);
    expect(league.queue[user1]).toBeGreaterThanOrEqual(before);
    expect(send).toHaveBeenNthCalledWith(
      i + 1,
      getQueueMessage(`<@!${user1}>`)
    );
  });

  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> queue 1s`));
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> queue 3s`));

  // The same user may not queue again.
  expect(send).toHaveBeenNthCalledWith(4, ERRORS.QUEUE_DUPLICATE_USER);
  expect(send).toHaveBeenNthCalledWith(5, ERRORS.QUEUE_DUPLICATE_USER);
  expect(send).toHaveBeenNthCalledWith(6, ERRORS.QUEUE_DUPLICATE_USER);

  done();
});

test("@LeagueBot queue 1s", async (done) => {
  const user1 = "cha";
  const user2 = "flips";
  const user3 = "bubbles";
  const user4 = "racoon";
  const matchId = `${league1s.id}-1`;

  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> queue 1s`));
  await discord.trigger("message", msg(user2, `<@!${BOT_ID}> queue 1s`));

  // When a user queues, they should receive a message with the updated list
  expect(send).toHaveBeenNthCalledWith(1, getQueueMessage(`<@!${user1}>`));

  // When enough users queue for a match:
  const match = await matches.get(matchId);

  // Match should be created in the database
  expect(match).toStrictEqual(
    expect.objectContaining({
      id: matchId,
      teamSize: 1,
      league: league1s.id,
      mode: "random",
      players: expect.objectContaining({
        [user1]: { team: expect.any(Number) },
        [user2]: { team: expect.any(Number) },
      }),
    })
  );

  const players = Object.keys(match.players);
  const team1 = players.filter((p) => match.players[p].team === 1);
  const team2 = players.filter((p) => match.players[p].team === 2);

  // Match details are correct
  expect(players.length).toBe(2);
  expect(team1.length).toBe(1);
  expect(team2.length).toBe(1);
  expect(match.teamSize).toBe(1);

  // Match details should be sent
  expect(send).toHaveBeenNthCalledWith(
    2,
    getMatchMessage({
      id: "11",
      team1,
      team2,
    })
  );

  // Users should be able to queue again and trigger another match
  await discord.trigger("message", msg(user3, `<@!${BOT_ID}> queue 1s`));
  await discord.trigger("message", msg(user4, `<@!${BOT_ID}> queue 1s`));

  expect(send).toHaveBeenCalledWith(
    getMatchMessage({
      id: "12",
      team1: [user3],
      team2: [user4],
    })
  );

  done();
});

test("@LeagueBot queue 2s", async (done) => {
  const users = ["space", "canada", "pugs", "dewberry"];
  const matchId = `${league2s.id}-1`;

  await discord.trigger("message", msg(users[0], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[1], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[2], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[3], `<@!${BOT_ID}> queue 2s`));

  // When a user queues, they should receive a message with the updated list
  expect(send).toHaveBeenNthCalledWith(1, getQueueMessage(`<@!${users[0]}>`));
  expect(send).toHaveBeenNthCalledWith(2, getQueueMessage(`<@!${users[1]}>`));
  expect(send).toHaveBeenNthCalledWith(3, getQueueMessage(`<@!${users[2]}>`));

  // When enough users queue for a match:
  const match = await matches.get(matchId);

  // Match mode voting message should be sent
  expect(send).toHaveBeenNthCalledWith(
    4,
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: `We've got a 2s match!`,
          value: `${users.map((id) => `<@!${id}>`).join(" ")}

Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.
`,
        }),
      ]),
    })
  );

  // Bot should react with the options first!
  expect(react).toHaveBeenCalledTimes(2);

  // Match should be created in the database, default "auto"
  expect(match).toStrictEqual(
    expect.objectContaining({
      id: matchId,
      teamSize: 2,
      league: league2s.id,
      mode: "auto",
      players: expect.objectContaining({
        [users[0]]: { team: expect.any(Number) },
        [users[1]]: { team: expect.any(Number) },
        [users[2]]: { team: expect.any(Number) },
        [users[3]]: { team: expect.any(Number) },
      }),
    })
  );

  const players = Object.keys(match.players).sort();
  const team1 = players.filter((p) => match.players[p].team === 1);
  const team2 = players.filter((p) => match.players[p].team === 2);

  // Match details are correct
  expect(players.length).toBe(4);
  expect(team1.length).toBe(2);
  expect(team2.length).toBe(2);
  expect(match.teamSize).toBe(2);

  // Match details should be sent
  expect(send).toHaveBeenNthCalledWith(
    5,
    getMatchMessage({
      id: "21",
      team1,
      team2,
    })
  );

  // Users should be able to queue again and trigger another match
  await discord.trigger("message", msg(users[0], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[1], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[2], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[3], `<@!${BOT_ID}> queue 2s`));

  const match2 = await matches.get(matchId);
  const players2 = Object.keys(match.players).sort();

  expect(send).toHaveBeenCalledWith(
    getMatchMessage({
      id: "22",
      team1: players2.filter((p) => match2.players[p].team === 1),
      team2: players2.filter((p) => match2.players[p].team === 2),
    })
  );

  done();
});

test("@LeagueBot queue 3s", async (done) => {
  const users = ["stardust", "quantum", "pickle", "quart", "cheese", "ginge"];
  const matchId = `${league3s.id}-1`;

  await discord.trigger("message", msg(users[0], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[1], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[2], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[3], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[4], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[5], `<@!${BOT_ID}> queue 3s`));

  // When a user queues, they should receive a message with the updated list
  expect(send).toHaveBeenNthCalledWith(1, getQueueMessage(`<@!${users[0]}>`));
  expect(send).toHaveBeenNthCalledWith(2, getQueueMessage(`<@!${users[1]}>`));
  expect(send).toHaveBeenNthCalledWith(3, getQueueMessage(`<@!${users[2]}>`));
  expect(send).toHaveBeenNthCalledWith(4, getQueueMessage(`<@!${users[3]}>`));
  expect(send).toHaveBeenNthCalledWith(5, getQueueMessage(`<@!${users[4]}>`));

  // When enough users queue for a match:
  const match = await matches.get(matchId);

  // Match mode voting message should be sent
  expect(send).toHaveBeenNthCalledWith(
    6,
    expect.objectContaining({
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: `We've got a 3s match!`,
          value: `${users.map((id) => `<@!${id}>`).join(" ")}

Vote 🤖 for automatically balanced teams, or 👻 for completely random ones.
`,
        }),
      ]),
    })
  );

  // Bot should react with the options first!
  expect(react).toHaveBeenCalledTimes(2);

  // Match should be created in the database, default "auto"
  expect(match).toStrictEqual(
    expect.objectContaining({
      id: matchId,
      teamSize: 3,
      league: league3s.id,
      mode: "auto",
      players: expect.objectContaining({
        [users[0]]: { team: expect.any(Number) },
        [users[1]]: { team: expect.any(Number) },
        [users[2]]: { team: expect.any(Number) },
        [users[3]]: { team: expect.any(Number) },
        [users[4]]: { team: expect.any(Number) },
        [users[5]]: { team: expect.any(Number) },
      }),
    })
  );

  const players = Object.keys(match.players).sort();
  const team1 = players.filter((p) => match.players[p].team === 1);
  const team2 = players.filter((p) => match.players[p].team === 2);

  // Match details are correct
  expect(players.length).toBe(6);
  expect(team1.length).toBe(3);
  expect(team2.length).toBe(3);
  expect(match.teamSize).toBe(3);

  // Match details should be sent
  expect(send).toHaveBeenNthCalledWith(
    7,
    getMatchMessage({
      id: "31",
      team1,
      team2,
    })
  );

  // Users should be able to queue again and trigger another match
  await discord.trigger("message", msg(users[0], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[1], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[2], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[3], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[4], `<@!${BOT_ID}> queue 3s`));
  await discord.trigger("message", msg(users[5], `<@!${BOT_ID}> queue 3s`));

  const match2 = await matches.get(matchId);
  const players2 = Object.keys(match.players).sort();

  expect(send).toHaveBeenCalledWith(
    getMatchMessage({
      id: "32",
      team1: players2.filter((p) => match2.players[p].team === 1),
      team2: players2.filter((p) => match2.players[p].team === 2),
    })
  );

  done();
});

test("@LeagueBot queue 2s [auto]", async (done) => {
  const users = ["hoody", "duke", "canada", "cha"];

  discord.users = {
    [users[0]]: { roles: ['SSL'] },
    [users[1]]: { roles: ['GC'] },
    [users[2]]: { roles: ['Champ'] },
    [users[3]]: { roles: ['Gold'] },
  }

  const matchId = `${league2s.id}-1`;

  await discord.trigger("message", msg(users[0], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[1], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[2], `<@!${BOT_ID}> queue 2s`));
  await discord.trigger("message", msg(users[3], `<@!${BOT_ID}> queue 2s`));

  // Bot should react with the options first!
  expect(react).toHaveBeenCalledTimes(2);

  const match = await matches.get(matchId);
  const players = Object.keys(match.players).sort();
  const team1 = players.filter((p) => match.players[p].team === 1);
  const team2 = players.filter((p) => match.players[p].team === 2);

  expect(team1).toStrictEqual([users[3], users[0]]);
  expect(team2).toStrictEqual([users[2], users[1]]);

  done();
});
