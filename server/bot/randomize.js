const queue = ['hoody', 'furby', 'racoon', 'space']
const players = {}
const teamSize = 2

for (let i = 0; i < teamSize * 2; i++) {
  const rand = Math.floor(Math.random() * queue.length)
  const player = queue.splice(rand, 1)
  const team = i % 2 === 0 ? 1 : 2
  players[player] = { team }
}

console.log(players)

