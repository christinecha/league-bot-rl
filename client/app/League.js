import React, { useEffect, useState } from 'react'
import { getMatches, getGuildUser } from '../api';
import { useTable, useSortBy } from 'react-table'
import styled from '@emotion/styled'
import { css } from '@emotion/css'

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

  let place = 1
  const sorted = Object.keys(players)
    .map(id => {
      const { win, loss } = players[id]
      return {
        id,
        win,
        loss,
        points: win - loss,
        ratio: win / (win + loss)
      }
    })
    .sort((a, b) => a.points < b.points ? 1 : -1)

  const placed = sorted
    .map((player, i) => {
      const prev = sorted[i - 1]
      if (prev && prev.points > player.points) place = i + 1
      return { ...player, place }
    })

  return placed
}

const DiscordUser = ({ userId, guildId }) => {
  const [user, setUser] = useState({})

  useEffect(() => {
    getGuildUser({ userId, guildId }).then(({ data }) => setUser(data))
  }, [userId, guildId])

  const rank = (user.roles || []).find(r => RANK_ROLES.includes(r.name))
  const imgSrc = user.user && user.user.avatarURL || ''

  return (
    <div className={css`
      display: flex;
      align-items: center;
    `}>
      <img
        src={imgSrc}
        alt={`Avatar for user ${user.displayName || userId}`}
        className={css`
          width: 20px;
          margin-right: 5px;
          border-radius: 100%;
          display: ${imgSrc ? 'inline' : 'none'};
        `}
      />
      {user.displayName || userId}{'  '}
      {/* {rank && rank.name} */}
    </div>
  )
}

const Styles = styled.div`
  table {
    border-spacing: 0;
    border: 1px solid white;
    width: 100%;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th {
      background: rgba(255,255,255,0.3);
      color: white;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.1em;
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid white;
      border-right: 1px solid white;

      :last-child {
        border-right: 0;
      }
    }
  }
`

const Table = ({ columns, data }) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
    initialState: { sortBy: [{ id: 'place' }] },
    disableSortRemove: true,
  }, useSortBy)

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? ' ↓'
                      : ' ↑'
                    : ''}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
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

  const data = getPlayerStats(matches)

  const columns = React.useMemo(
    () => [
      {
        Header: '#',
        accessor: 'place',
        id: 'place'
      },
      {
        Header: 'Player',
        accessor: 'id',
        Cell: ({ value }) => <DiscordUser userId={value} guildId={guildId} />
      },
      {
        Header: 'Stats',
        columns: [
          {
            Header: 'Wins',
            accessor: 'win',
          },
          {
            Header: 'Losses',
            accessor: 'loss',
          },
          {
            Header: 'Points',
            accessor: 'points',
          },
          {
            Header: 'Win Ratio',
            accessor: 'ratio',
            Cell: ({ value }) => `${(value * 100).toFixed(1)}%`
          },
        ],
      },
    ],
    []
  )

  return (
    <Styles>
      <Table columns={columns} data={data} />
    </Styles>
  )
}

export default League