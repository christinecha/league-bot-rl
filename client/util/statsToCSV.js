export const statsToCSV = ({ stats, users }) => {
  const headers = [
    'id',
    'name',
    'matches-total',
    'matches-lost',
    'matches-won',
    'place',
    'points',
    'win-ratio',
  ]
  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += `${headers.join(',')}\n`

  stats.forEach((player, i) => {
    const playerStats = [
      player.id,
      users[player.id] ? users[player.id].username : 'Unknown User',
      player.loss + player.win,
      player.loss,
      player.win,
      player.place,
      player.points,
      player.ratio,
    ]
    csvContent += `${playerStats.join(',')}\n`
  })
  return encodeURI(csvContent)
}
