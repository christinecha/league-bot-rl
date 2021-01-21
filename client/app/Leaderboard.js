import React, { useState, useEffect } from 'react'
import { css } from '@emotion/css'
import qs from 'qs'
import League from './League'
import { getGuild } from '../api'
import * as storage from '../../shared/localStorage'

const { guildId, teamSize } = qs.parse(window.location.search, {
  ignoreQueryPrefix: true,
})

const LeagueTab = ({ teamSize, onSelect, active }) => {
  return (
    <button
      onClick={() => onSelect(teamSize)}
      className={css`
        border: none;
        background: transparent;
        color: ${active ? '#90ff00' : 'white'};
        font-size: 20px;
        line-height: 1em;
        padding: 0;
        padding-bottom: 3px;
        margin-right: 20px;
        cursor: pointer;
        ${active ? 'border-bottom: 1px solid #90ff00;' : ''};

        &:focus {
          outline: 1px solid #90ff00;
          outline-offset: 4px;
        }
      `}
    >
      {teamSize}s League
    </button>
  )
}

const Loading = () => {
  return (
    <div data-row>
      <div data-col="12">Loading...</div>
    </div>
  )
}

const NotFound = () => {
  return (
    <div data-row>
      <div data-col="12">Leaderboard not found. :'(</div>
    </div>
  )
}

export const Leaderboard = () => {
  const initialSize = [1, 2, 3, 4].find((t) => t === parseInt(teamSize)) || 3
  const [show4s, setShow4s] = useState(false)
  const [size, setSize] = useState(initialSize)
  const [loading, setLoading] = useState(true)
  const [guild, setGuild] = useState()

  useEffect(() => {
    getGuild({ guildId })
      .then(({ data }) => {
        setGuild(data)
        const guildIds = storage.getArray(storage.KEYS.SERVERS)
        if (!guildIds.includes(guildId)) {
          storage.setArray(storage.KEYS.SERVERS, [...guildIds, guildId])
        }
      })
      .finally(() => setLoading(false))
  }, [setGuild])

  const set4s = () => {
    if (!show4s) setSize(4)
    else setSize(initialSize)
    setShow4s(!show4s)
  }

  if (!loading && !guild) return <NotFound />
  if (!guild) return <Loading />

  return (
    <div data-row>
      <div data-col="12">
        <section
          className={css`
            display: flex;
          `}
        >
          <h1
            className={css`
              flex: 1;
              text-transform: uppercase;
            `}
          >
            {guild.name} Leaderboard
          </h1>
          <span
            className={css`
              display: flex;
              align-items: center;
              cursor: pointer;
              user-select: none;
            `}
            onClick={set4s}
          >
            {show4s ? '👻' : '🏆'}
          </span>
        </section>

        {!show4s && (
          <>
            <LeagueTab onSelect={setSize} teamSize={1} active={size === 1} />
            <LeagueTab onSelect={setSize} teamSize={2} active={size === 2} />
            <LeagueTab onSelect={setSize} teamSize={3} active={size === 3} />
          </>
        )}

        {show4s && (
          <LeagueTab onSelect={setSize} teamSize={4} active={size === 4} />
        )}

        <br />
        <br />
        <League teamSize={size} guildId={guildId} />
      </div>
    </div>
  )
}
