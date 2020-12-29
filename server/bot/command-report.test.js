// Start mock server!
require("./index");
const firebase = require("@firebase/rules-unit-testing");
const matches = require("../data/matches");
const { discord } = require("../data/util/discord");
const { parseMatchId } = require('../data/matchId')
const ERRORS = require("./constants/ERRORS");
const { match1s } = require("../../test/match");
const BOT_ID = process.env.BOT_ID;

let send, msg;

beforeAll(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  });

  done();
});

beforeEach(async (done) => {
  send = jest.fn();
  msg = (userId, content) => ({
    content,
    author: { id: userId },
    guild: { id: "h000" },
    channel: { send, id: '55' },
  });

  await matches.create(match1s);
  done();
});

afterEach(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  });
  done();
});

test("@LeagueBot win <matchId>", async (done) => {
  const user1 = Object.keys(match1s.players)[0];
  const user2 = 'gobbledigook'
  const match1Key = parseMatchId(match1s.id).key

  // A user that was not in the match may not report the match.
  await discord.trigger("message", msg(user2, `<@!${BOT_ID}> win ${match1Key}`));
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MATCH_NO_SUCH_USER);

  // When reported correctly, winner should be set correctly in the database.
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> win ${match1Key}`));
  const match1 = await matches.get(match1s.id);
  const winner = match1s.players[user1].team;
  expect(match1.winner).toBe(winner)
  expect(send).toHaveBeenNthCalledWith(2, expect.stringContaining(`Team ${winner} won Match #${match1Key}!`));

  // An already reported match may not be re-reported.
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> win ${match1Key}`));
  expect(send).toHaveBeenNthCalledWith(3, ERRORS.MATCH_DUPLICATE_REPORT);

  done();
});

test("@LeagueBot loss <matchId>", async (done) => {
  const user1 = Object.keys(match1s.players)[0];
  const user2 = 'gobbledigook'
  const match1Key = parseMatchId(match1s.id).key

  // A user that was not in the match may not report the match.
  await discord.trigger("message", msg(user2, `<@!${BOT_ID}> loss ${match1Key}`));
  expect(send).toHaveBeenNthCalledWith(1, ERRORS.MATCH_NO_SUCH_USER);

  // When reported correctly, winner should be set correctly in the database.
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> loss ${match1Key}`));
  const match1 = await matches.get(match1s.id);
  const winner = match1s.players[user1].team === 1 ? 2 : 1;
  expect(match1.winner).toBe(winner)
  expect(send).toHaveBeenNthCalledWith(2, expect.stringContaining(`Team ${winner} won Match #${match1Key}!`));

  // An already reported match may not be re-reported.
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> loss ${match1Key}`));
  expect(send).toHaveBeenNthCalledWith(3, ERRORS.MATCH_DUPLICATE_REPORT);

  done();
});