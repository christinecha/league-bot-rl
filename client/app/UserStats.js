import { css } from '@emotion/css'
import Color from 'color'
import React, { useEffect, useRef, useState } from 'react'
import COLORS from '../../shared/COLORS'
import { getGuildUserStats } from '../api'
import { DiscordUser } from './DiscordUser'
import { Table } from './Table'
import { useGuildUsers } from './useGuildUsers'

function percentageToColor(percentage, maxHue = 90, minHue = 0) {
  const hue = percentage * (maxHue - minHue) + minHue
  return `hsl(${hue}, 100%, 40%)`
}

export const UserStatsTable = ({ stats, avg }) => {
  const { members } = useGuildUsers()

  const columns = React.useMemo(
    () => [
      {
        Header: 'Player',
        accessor: 'id',
        Cell: ({ value }) => (
          <DiscordUser userId={value} data={members[value]} />
        ),
      },
      {
        Header: 'Match Stats',
        columns: [
          {
            Header: 'Wins',
            id: 'win',
            accessor: 'win',
          },
          {
            Header: 'Losses',
            accessor: 'loss',
          },
          {
            Header: 'Total',
            id: 'total',
            accessor: (row) => row.win + row.loss,
          },
          {
            Header: 'Win %',
            id: 'win-ratio',
            accessor: (row) => {
              return row.win / (row.win + row.loss) || 0
            },
            sortMethod: (a, b) => a - b,
            Cell: ({ value }) => `${(value * 100).toFixed(1)}%`,
          },
          {
            Header: '+/-',
            id: 'deviation',
            accessor: (row) => {
              return (row.win / (row.win + row.loss) || 0) - avg
            },
            sortMethod: (a, b) => a - b,
            Cell: ({ value }) => {
              const rangeValue = value + 1 / 2
              const color = percentageToColor(rangeValue)

              return (
                <label
                  className={css`
                    margin-bottom: 0 !important;
                    padding: 2px;
                    text-align: center;
                    background: ${color};
                  `}
                >
                  {(value * 100).toFixed(1)}%
                </label>
              )
            },
          },
        ],
      },
    ],
    [stats]
  )

  return (
    <Table
      columns={columns}
      data={stats}
      initialState={{
        sortBy: [{ id: 'total', desc: true }],
      }}
    />
  )
}

export const UserStats = ({ user, stats, onClose }) => {
  const overlayRef = useRef()

  if (!user) {
    return null
  }

  const userStats = stats.find((s) => s.id === user.id)

  if (!userStats) {
    return 'No matches played.'
  }

  const allMatches = userStats.matches || []
  const userMatches = allMatches.filter((m) =>
    Object.keys(m.players).includes(user.id)
  )

  const opponentStats = {}
  const teammateStats = {}

  userMatches.forEach((m) => {
    const myTeam = m.players[user.id].team
    const won = myTeam === m.winner
    const playerIds = Object.keys(m.players).filter((id) => id !== user.id)
    const teammates = playerIds.filter((p) => m.players[p].team === myTeam)
    const opponents = playerIds.filter((p) => m.players[p].team !== myTeam)

    teammates.forEach((t) => {
      teammateStats[t] = teammateStats[t] || { id: t, win: 0, loss: 0 }
      teammateStats[t][won ? 'win' : 'loss'] += 1
    })

    opponents.forEach((o) => {
      opponentStats[o] = opponentStats[o] || { id: o, win: 0, loss: 0 }
      opponentStats[o][won ? 'win' : 'loss'] += 1
    })
  })

  return (
    <div
      ref={overlayRef}
      className={css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
      `}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className={css`
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          width: 80%;
          max-width: 800px;
          max-height: 80vh;
          background: ${COLORS.BLACK};
          padding: 30px;
          overflow-y: scroll;

          label {
            margin-bottom: 10px;
          }
        `}
      >
        <label>Head-to-Head User Stats</label>
        <DiscordUser userId={user.id} data={user} />
        <label />
        <label>{userStats.win} wins</label>
        <label>{userStats.loss} losses</label>
        <label>{`${(userStats.ratio * 100).toFixed(1)}% win ratio`}</label>
        <br />
        <div>
          <label>Stats Playing With:</label>
          <UserStatsTable
            stats={Object.values(teammateStats)}
            avg={userStats.ratio}
          />
        </div>
        <br />
        <br />
        <div>
          <label>Stats Playing Against:</label>
          <UserStatsTable
            stats={Object.values(opponentStats)}
            avg={userStats.ratio}
          />
        </div>
      </div>
    </div>
  )
}
