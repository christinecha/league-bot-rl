const getTeamCombos = (teamSize) => {
  const queue = new Array(teamSize * 2).fill('').map((_, i) => i)

  const findCombos = (remaining, size) => {
    let combos = []

    if (size === 1) {
      return remaining.map(r => [r])
    }

    for (let i = 0; i < remaining.length; i++) {
      const others = findCombos(remaining.slice(i + 1), size - 1)

      others.forEach(o => {
        const combo = [
          remaining[i],
          ...o
        ]

        combos.push(combo)
      })
    }

    return combos
  }

  const allCombos = findCombos(queue, teamSize)
  const ids = []
  const orders = []

  const $ = arr => arr.sort().join('_')

  allCombos.forEach(combo => {
    const team1 = combo
    const team2 = queue.filter(q => !combo.includes(q))

    if (ids.includes($(team1)) || ids.includes($(team2))) return

    const order = queue.map(q => combo.includes(q) ? 1 : 2)
    ids.push($(team1))
    orders.push(order)
  })

  return orders
}

module.exports = { getTeamCombos }