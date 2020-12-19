const leagues = require("../data/leagues");
const { getTeamCombos } = require("./getTeamCombos");

test("get 3s combos", async (done) => {
  const combos = getTeamCombos(3);
  expect(combos).toMatchInlineSnapshot(`
    Array [
      Array [
        1,
        1,
        1,
        2,
        2,
        2,
      ],
      Array [
        1,
        1,
        2,
        1,
        2,
        2,
      ],
      Array [
        1,
        1,
        2,
        2,
        1,
        2,
      ],
      Array [
        1,
        1,
        2,
        2,
        2,
        1,
      ],
      Array [
        1,
        2,
        1,
        1,
        2,
        2,
      ],
      Array [
        1,
        2,
        1,
        2,
        1,
        2,
      ],
      Array [
        1,
        2,
        1,
        2,
        2,
        1,
      ],
      Array [
        1,
        2,
        2,
        1,
        1,
        2,
      ],
      Array [
        1,
        2,
        2,
        1,
        2,
        1,
      ],
      Array [
        1,
        2,
        2,
        2,
        1,
        1,
      ],
    ]
  `);
  done();
});

test("get 2s combos", async (done) => {
  const combos = getTeamCombos(2);
  expect(combos).toMatchInlineSnapshot(`
    Array [
      Array [
        1,
        1,
        2,
        2,
      ],
      Array [
        1,
        2,
        1,
        2,
      ],
      Array [
        1,
        2,
        2,
        1,
      ],
    ]
  `);
  done();
});

test("get 1s combos", async (done) => {
  const combos = getTeamCombos(1);
  expect(combos).toMatchInlineSnapshot(`
    Array [
      Array [
        1,
        2,
      ],
    ]
  `);
  done();
});
