import React, { useEffect, useState, useRef } from 'react'
import { getGuildUser, getStats } from '../api'
import { useTable, useSortBy } from 'react-table'
import styled from '@emotion/styled'
import { css } from '@emotion/css'
import { statsToCSV } from '../util/statsToCSV'

const DiscordUser = ({ userId, data: user = {} }) => {
  const imgSrc = user.avatarURL || ''

  return (
    <div
      className={css`
        display: flex;
        align-items: center;
      `}
    >
      <img
        src={imgSrc}
        alt={`Avatar for user ${user.username || userId}`}
        className={css`
          width: 20px;
          margin-right: 5px;
          border-radius: 100%;
          display: ${imgSrc ? 'inline' : 'none'};
        `}
      />
      {user.username || userId}
      {'  '}
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
      background: rgba(255, 255, 255, 0.3);
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
  } = useTable(
    {
      columns,
      data,
      initialState: { sortBy: [{ id: 'place' }] },
      disableSortRemove: true,
    },
    useSortBy
  )

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? ' ↓' : ' ↑') : ''}
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
              {row.cells.map((cell) => {
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
  const [stats, setStats] = useState([])
  const membersRef = useRef({})
  const [members, setMembers] = useState({})
  const [csv, setCSV] = useState()
  const [loading, setLoading] = useState(true)
  const league = `${guildId}-${teamSize}`

  useEffect(() => {
    setLoading(true)
    getStats({ leagueId: league })
      .then(({ data }) => {
        setStats(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [teamSize])

  useEffect(() => {
    setCSV(null)
    const userIds = stats.map((s) => s.id)

    Promise.all(
      userIds.map((userId) => {
        return getGuildUser({ userId, guildId }).then((res) => {
          const user = res ? res.data : null
          membersRef.current = { ...membersRef.current, [userId]: user }
          setMembers(membersRef.current)
        })
      })
    ).then(() => {
      const _csv = statsToCSV({ stats, users: membersRef.current })
      setCSV(_csv)
    })
  }, [stats])

  const columns = React.useMemo(
    () => [
      {
        Header: '#',
        accessor: 'place',
        id: 'place',
      },
      {
        Header: 'Player',
        accessor: 'id',
        Cell: ({ value }) => (
          <DiscordUser userId={value} guildId={guildId} data={members[value]} />
        ),
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
            Header: 'Win %',
            accessor: 'ratio',
            Cell: ({ value }) => `${(value * 100).toFixed(1)}%`,
          },
        ],
      },
    ],
    [members]
  )

  if (loading) {
    return 'Loading stats...'
  }

  if (!loading && !stats.length) {
    return "No matches found. :'("
  }

  return (
    <Styles>
      {csv && (
        <a download="Leaderboard_Stats" href={csv} target="_blank">
          <button
            className={css`
              border: 1px solid currentColor;
              margin-bottom: 0.5rem;
            `}
          >
            Download Stats (.csv)
          </button>
        </a>
      )}

      {!csv && (
        <button
          className={css`
            border: 1px solid currentColor;
            margin-bottom: 0.5rem;
          `}
          disabled
        >
          Generating CSV...
        </button>
      )}

      <Table columns={columns} data={stats} />
    </Styles>
  )
}

export default League
