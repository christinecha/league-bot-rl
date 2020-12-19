const leagues = require("../data/leagues");
const createMatch = require("./createMatch");
const { getLeagueStats } = require("../getLeagueStats");
const { getGuildUser } = require("../getGuildUser");

jest.mock("../getLeagueStats");
jest.mock("../getGuildUser");

const league1s = {
  id: "h000-1",
  teamSize: 1,
};

const league2s = {
  id: "h000-2",
  teamSize: 2,
};

const league3s = {
  id: "h000-3",
  teamSize: 3,
};

beforeEach(async (done) => {
  await leagues.create(league1s);
  await leagues.create(league2s);
  await leagues.create(league3s);
  done();
});

afterEach(async (done) => {
  await leagues.delete(league1s.id);
  await leagues.delete(league2s.id);
  await leagues.delete(league3s.id);
  done();
});

test("create a random 1s match", async (done) => {
  const match = await createMatch({
    leagueId: "h000-1",
    playerIds: ["racoon", "cheese"],
    mode: "random",
    teamSize: 1,
  });

  const team1 = Object.values(match.players).filter((p) => p.team === 1);
  const team2 = Object.values(match.players).filter((p) => p.team === 2);

  // All players are unique
  expect(Object.keys(match.players).length).toBe(2);

  // All teams have enough players
  expect(team1.length).toBe(1);
  expect(team2.length).toBe(1);

  // Team size is correct
  expect(match.teamSize).toBe(1);

  // You should be able to queue a new one!
  await expect(
    createMatch({
      leagueId: "h000-1",
      playerIds: ["canada", "cha"],
      mode: "random",
      teamSize: 1,
    })
  ).resolves.not.toThrow()

  done();
});

test("create a random 2s match", async (done) => {
  const match = await createMatch({
    leagueId: "h000-2",
    playerIds: ["mark", "stardust", "space", "bubbles"],
    mode: "random",
    teamSize: 2,
  });

  const team1 = Object.values(match.players).filter((p) => p.team === 1);
  const team2 = Object.values(match.players).filter((p) => p.team === 2);

  // All players are unique
  expect(Object.keys(match.players).length).toBe(4);

  // All teams have enough players
  expect(team1.length).toBe(2);
  expect(team2.length).toBe(2);

  // Team size is correct
  expect(match.teamSize).toBe(2);

  const nextMatch = await createMatch({
    leagueId: "h000-2",
    playerIds: ["mark", "stardust", "space", "bubbles"],
    mode: "random",
    teamSize: 2,
  });

  // Random teams should not be the same order twice!
  expect(nextMatch.players).not.toStrictEqual(match.players);

  done();
});

test("create an auto-balanced 2s match", async (done) => {
  getLeagueStats.mockResolvedValue({
    mark: { ratio: 0.5 },
    stardust: { ratio: 0.9 },
    space: { ratio: 0.4 },
    bubbles: { ratio: 0.3 },
  });

  getGuildUser
    .mockResolvedValueOnce({ id: "mark", rank: 8 })
    .mockResolvedValueOnce({ id: "stardust", rank: 5 })
    .mockResolvedValueOnce({ id: "space", rank: 5 })
    .mockResolvedValueOnce({ id: "bubbles", rank: 3 });

  const match = await createMatch({
    leagueId: "h000-2",
    playerIds: ["mark", "stardust", "space", "bubbles"],
    mode: "auto",
    teamSize: 2,
  });

  const team1 = Object.values(match.players).filter((p) => p.team === 1);
  const team2 = Object.values(match.players).filter((p) => p.team === 2);

  // All players are unique
  expect(Object.keys(match.players).length).toBe(4);

  // All teams have enough players
  expect(team1.length).toBe(2);
  expect(team2.length).toBe(2);

  // Team size is correct
  expect(match.teamSize).toBe(2);

  // Teams are balanced
  expect(match.players).toMatchInlineSnapshot(`
    Object {
      "bubbles": Object {
        "team": 1,
      },
      "mark": Object {
        "team": 1,
      },
      "space": Object {
        "team": 2,
      },
      "stardust": Object {
        "team": 2,
      },
    }
  `);

  done();
});

test("create an auto-balanced 3s match", async (done) => {
  getLeagueStats.mockResolvedValue({
    mark: { ratio: 0.5 },
    stardust: { ratio: 0.9 },
    space: { ratio: 0.4 },
    bubbles: { ratio: 0.3 },
    cha: { ratio: 0.3 },
    hoody: { ratio: 1 },
  });

  getGuildUser
    .mockResolvedValueOnce({ id: "mark", rank: 7 })
    .mockResolvedValueOnce({ id: "stardust", rank: 5 })
    .mockResolvedValueOnce({ id: "space", rank: 5 })
    .mockResolvedValueOnce({ id: "bubbles", rank: 3 })
    .mockResolvedValueOnce({ id: "cha", rank: 2 })
    .mockResolvedValueOnce({ id: "hoody", rank: 9 });

  const match = await createMatch({
    leagueId: "h000-3",
    playerIds: ["mark", "stardust", "space", "bubbles", "cha", "hoody"],
    mode: "auto",
    teamSize: 3,
  });

  const team1 = Object.values(match.players).filter((p) => p.team === 1);
  const team2 = Object.values(match.players).filter((p) => p.team === 2);

  // All players are unique
  expect(Object.keys(match.players).length).toBe(6);

  // All teams have enough players
  expect(team1.length).toBe(3);
  expect(team2.length).toBe(3);

  // Team size is correct
  expect(match.teamSize).toBe(3);

  // Teams are balanced
  expect(match.players).toMatchInlineSnapshot(`
    Object {
      "bubbles": Object {
        "team": 2,
      },
      "cha": Object {
        "team": 1,
      },
      "hoody": Object {
        "team": 1,
      },
      "mark": Object {
        "team": 2,
      },
      "space": Object {
        "team": 1,
      },
      "stardust": Object {
        "team": 2,
      },
    }
  `);

  done();
});
