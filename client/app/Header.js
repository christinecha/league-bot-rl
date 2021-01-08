import React, { useEffect, useState } from 'react'
import qs from 'qs'
import { css } from '@emotion/css'
import { Leaderboard } from './Leaderboard'
import { Home } from './Home'
import COLORS from '../../shared/COLORS'
import * as storage from '../../shared/localStorage'
import { getGuild } from '../api'

const guildIds = storage.getArray(storage.KEYS.SERVERS)

export const Header = () => {
  const [servers, setServers] = useState()
  const [showServers, setShowServers] = useState(false)

  useEffect(() => {
    guildIds.forEach((guildId) => {
      getGuild({ guildId }).then(({ data }) => {
        console.log(guildId, data)
        setServers({ ...servers, [guildId]: data })
      })
    })
  }, [])

  return (
    <div data-row>
      <div data-col="12">
        <header
          className={css`
            display: flex;
            align-items: flex-end;
            border-bottom: 1px solid ${COLORS.BLUE};
            padding: 0.5rem 0;
          `}
        >
          <div>
            <img
              className={css`
                width: 2rem;
                border-radius: 100%;
              `}
              src="/assets/league-bot-avatar.png"
              alt="League Bot Avatar"
            />
          </div>
          <div
            className={css`
              position: relative;
              margin-left: auto;
            `}
          >
            <button
              className={css`
                text-transform: uppercase;
                font-size: 0.7rem;
                letter-spacing: 0.1em;
                padding: 0;

                &:hover {
                  color: ${COLORS.PINK};
                }
              `}
              onClick={() => setShowServers(true)}
            >
              Recently Viewed
            </button>
            {showServers && servers && (
              <div
                className={css`
                  position: absolute;
                  top: 100%;
                  right: 0;
                  border: 1px solid ${COLORS.BLUE};
                  background: ${COLORS.BLACK};
                  padding: 10px;
                  width: 15rem;
                `}
              >
                {guildIds.map((id) => {
                  if (!servers[id]) return null
                  console.log(servers)
                  return <a href={`/?guildId=${id}`}>{servers[id].name}</a>
                })}
              </div>
            )}
          </div>
        </header>
      </div>
    </div>
  )
}
