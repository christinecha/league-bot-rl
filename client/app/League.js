import React, { useEffect, useState, useRef } from 'react'
import { getGuildUser, getStats } from '../api'
import { css } from '@emotion/css'
import { statsToCSV } from '../util/statsToCSV'
import { UserStats } from './UserStats'
import { DiscordUser } from './DiscordUser'
import { Table } from './Table'
import { GuildUsersProvider, useGuildUsers } from './useGuildUsers'

const LeagueStats = ({ guildId, stats }) => {
  const [selectedUser, setSelectedUser] = useState()
  const [csv, setCSV] = useState()
  const { members, complete } = useGuildUsers()

  useEffect(() => {
    if (!complete) {
      return setCSV(null)
    }

    const _csv = statsToCSV({ stats, users: members })
    setCSV(_csv)
  }, [complete])

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
          <DiscordUser
            userId={value}
            guildId={guildId}
            data={members[value]}
            onClick={() => setSelectedUser(value)}
          />
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

  return (
    <>
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

      {selectedUser && (
        <UserStats
          user={members[selectedUser]}
          stats={stats}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <Table columns={columns} data={stats} />
    </>
  )
}

const League = ({ teamSize, guildId }) => {
  const [stats, setStats] = useState([])
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

  if (loading) return 'Loading stats...'

  if (!loading && !stats.length) return "No matches found. :'("

  return (
    <GuildUsersProvider guildId={guildId} userIds={stats.map((s) => s.id)}>
      <LeagueStats stats={stats} teamSize={teamSize} guildId={guildId} />
    </GuildUsersProvider>
  )
}

export default League
