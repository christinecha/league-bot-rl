const { COMMANDS } = require('./commands')

test('Mod-only commands', () => {
  const modOnly = Object.values(COMMANDS).filter((c) => c.modOnly)
  expect(modOnly.map((c) => c.command)).toMatchInlineSnapshot(`
    Array [
      "start",
      "end",
      "start-all",
      "end-all",
      "reset",
      "mod",
      "void",
      "fix",
    ]
  `)
})

test('No duplicates', () => {
  const all = Object.values(COMMANDS)
  const obj = {}
  const arr = []

  all.forEach((c) => {
    obj[c.command] = true
    arr.push(c.command)
    if (c.aliases) {
      c.aliases.forEach((a) => {
        obj[a] = true
        arr.push(a)
      })
    }
  })

  expect(Object.keys(obj).length).toBe(arr.length)
})
