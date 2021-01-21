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
  const [servers, setServers] = useState({})
  const [showServers, setShowServers] = useState(false)

  useEffect(() => {
    const guildPromises = guildIds.map((guildId) => getGuild({ guildId }))
    Promise.all(guildPromises).then((guilds) => {
      const _servers = { ...servers }
      guilds.forEach(({ data }) => {
        _servers[data.id] = data
      })
      setServers(_servers)
    })
  }, [guildIds])

  return (
    <div data-row>
      <div data-col="12">
        <header
          className={css`
            position: relative;
            display: flex;
            align-items: center;
            border-bottom: 1px solid ${COLORS.BLUE};
            padding: 0.5rem 0;
            margin-bottom: 2rem;
          `}
        >
          <a
            href="/"
            className={css`
              border: none;
            `}
          >
            <img
              className={css`
                height: 1.5rem;
                margin-left: -0.2rem;
              `}
              src="/assets/league-bot-horizontal.png"
              alt="League Bot Avatar"
            />
          </a>
          <div
            className={css`
              margin-left: auto;
            `}
          >
            {!!Object.keys(servers).length && (
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
                onClick={() => setShowServers(!showServers)}
              >
                {showServers ? '- Collapse' : '+ Recently Viewed'}
              </button>
            )}
          </div>
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
                display: flex;
                flex-direction: column;
                align-items: flex-end;
              `}
            >
              {Object.values(servers).map(({ id, name }) => {
                console.log(servers)
                return (
                  <a
                    key={id}
                    href={`/?guildId=${id}`}
                    className={css`
                      margin: 0.2rem 0;
                    `}
                  >
                    {name.toUpperCase()}
                  </a>
                )
              })}
            </div>
          )}
        </header>
      </div>
    </div>
  )
}
