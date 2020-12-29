// Start mock server!
require("./index");
const firebase = require("@firebase/rules-unit-testing");
const matches = require("../data/matches");
const { discord } = require("../data/util/discord");
const { parseMatchId } = require('../data/matchId')
const ERRORS = require("./constants/ERRORS");
const { match1s, match2s } = require("../../test/match");
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
  await matches.create({ ...match2s, winner: 2 });
  done();
});

afterEach(async (done) => {
  await firebase.clearFirestoreData({
    projectId: process.env.GCLOUD_PROJECT,
  });
  done();
});

test("@LeagueBot cancel <matchId>", async (done) => {
  const user1 = "cha";
  const match1Key = parseMatchId(match1s.id).key
  const match2Key = parseMatchId(match2s.id).key

  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> cancel ${match1Key}`));
  await discord.trigger("message", msg(user1, `<@!${BOT_ID}> cancel ${match2Key}`));

  const match1 = await matches.get(match1s.id);
  const match2 = await matches.get(match2s.id);

  // The unreported match should be deleted, and a confirmation sent.
  expect(match1).toBeFalsy();
  expect(send).toHaveBeenNthCalledWith(1, `Match #${match1Key} was canceled.`);

  // The reported match should not be deleted, and an error sent.
  expect(match2).toBeTruthy();
  expect(send).toHaveBeenNthCalledWith(2, ERRORS.MATCH_UNCANCELABLE);

  done();
});