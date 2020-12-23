import React, { useState, useEffect } from 'react'
import { css } from '@emotion/css'
import qs from 'qs'
import League from './League'
import { getGuild } from '../api'

const { guildId, teamSize } = qs.parse(window.location.search, { ignoreQueryPrefix: true })

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
    <div>
      Loading...
    </div>
  )
}

const NotFound = () => {
  return (
    <div>
      Leaderboard not found. :'(
    </div>
  )
}

export const Leaderboard = () => {
  const initialSize = [1, 2, 3, 4].find(t => t === parseInt(teamSize)) || 3
  const [size, setSize] = useState(initialSize)
  const [loading, setLoading] = useState(true)
  const [guild, setGuild] = useState()

  useEffect(() => {
    getGuild({ guildId })
      .then(({ data }) => setGuild(data))
      .finally(() => setLoading(false))
  }, [setGuild])

  if (!loading && !guild) return <NotFound />
  if (!guild) return <Loading />

  return (
    <div>
      <h1 className={css`
        text-transform: uppercase;
      `}>
        {guild.name} Leaderboard
      </h1>

      <LeagueTab onSelect={setSize} teamSize={1} active={size === 1} />
      <LeagueTab onSelect={setSize} teamSize={2} active={size === 2} />
      <LeagueTab onSelect={setSize} teamSize={3} active={size === 3} />
      <LeagueTab onSelect={setSize} teamSize={4} active={size === 4} />
      <br />
      <br />
      <League teamSize={size} guildId={guildId} />
    </div>
  )
}