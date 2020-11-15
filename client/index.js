import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import qs from 'qs'
import { getMatches, getGuildUser } from './api';

const RANK_ROLES = [
  'Bronze',
  'Gold',
  'Silver',
  'Platinum',
  'Diamond',
  'Champion',
  'Grand Champion',
  'Supersonic Legend',
]

const getPlayerStats = (matches) => {
  const players = {}

  matches.forEach(m => {
    Object.keys(m.players).forEach(playerId => {
      if (!m.winner) return

      players[playerId] = players[playerId] || { win: 0, loss: 0 }

      const didWin = m.winner === m.players[playerId].team
      players[playerId][didWin ? 'win' : 'loss'] += 1
    })
  })

  Object.keys(players).forEach(id => {
    const { win, loss } = players[id]
    players[id].points = win - loss
    players[id].ratio = win / (win + loss)
  })

  return players
}

const DiscordUser = ({ userId, guildId }) => {
  const [user, setUser] = useState({})

  useEffect(() => {
    getGuildUser({ userId, guildId }).then(({ data }) => setUser(data))
  }, [userId, guildId])

  console.log(user, user.roles)

  const rank = (user.roles || []).find(r => RANK_ROLES.includes(r.name))

  return (
    <span>
      <img src={user.user && user.user.avatarURL} width={20} />{'  '}
      {user.displayName || userId}{'  '}
      {rank && rank.name}
    </span>
  )
}

const League = ({ teamSize, guildId }) => {
  const [matches, setMatches] = useState([])
  const league = `${guildId}-${teamSize}`

  useEffect(() => {
    getMatches({ teamSize, league }).then(({ data }) => {
      setMatches(data)
    })
  }, [teamSize])

  const players = getPlayerStats(matches)
  const sortedPlayers = Object.keys(players).sort((a, b) => {
    return players[b].points - players[a].points
  })

  return (
    <div>
      <h2>{teamSize}s League</h2>

      <table>
        {sortedPlayers.map((id, index) => {
          const { win, loss, points, ratio } = players[id]
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td><DiscordUser userId={id} guildId={guildId} /></td>
              <td>{points} points</td>
              <td>{win} wins</td>
              <td>{loss} losses</td>
              <td>{(ratio * 100).toFixed(2)}% ratio</td>
            </tr>
          )
        })}
      </table>
    </div>
  )
}

const App = () => {
  const { guildId } = qs.parse(window.location.search, { ignoreQueryPrefix: true })

  return (
    <main>
      <h1>LEADERBOARD</h1>
      <p>
        this looks super ugly but ignore that for now
      </p>

      <br />
      <League teamSize={1} guildId={guildId} />
      <League teamSize={2} guildId={guildId} />
      <League teamSize={3} guildId={guildId} />
    </main>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)