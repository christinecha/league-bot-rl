import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/css'
import { COMMANDS } from '../../shared/commands'

const PINK = '#ff2181'

const StyledButton = styled.button`
  border-radius: 4px;
  outline: none;
  border: none;
  background: ${PINK};
  color: white;
  text-transform: uppercase;
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
`

const StyledCommand = ({ command, aliases, argument, description }) => {
  return (
    <div className={css`
      margin-bottom: 8px;
    `}>
      <span className={css`
        background: #434343;
        color: #dcdcdc;
        margin-right: 4px;
      `}>@LeagueBot {command} {argument && `(${argument})`}</span>
      <br />
      <span>{description}</span>
    </div>
  )
}

const StyledBeta = styled.span`
  font-size: 1rem;
  margin-left: 10px;
  background: blue;
  color: white;
`

export const Home = () => {
  return (
    <div>
      <div data-row>
        <div data-col="12">
          <h1>League Bot<StyledBeta>beta</StyledBeta></h1>
          <p className={css`max-width: 500px;`}>A Discord bot to help manage Rocket League leaderboards within your server.</p>
        </div>
      </div>
      <div data-row="6"></div>
      <div data-row>
        <div data-col="12">
          <a target="_blank" href="https://discord.com/oauth2/authorize?client_id=775129640322203658&scope=bot">
            <StyledButton>Add it to my server</StyledButton>
          </a>
        </div>
      </div>

      <div data-row="6"></div>

      <div data-row>
        <div data-col="12">
          <h3>Commands</h3>
          <ul>
            {Object.values(COMMANDS).map(c => (
              <li>
                <StyledCommand {...c} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div data-row="6"></div>

      <div data-row>
        <div data-col="12">
          <h3>Questions? Suggestions? Compliments?</h3>
          Talk to #cha1949 on Discord.
        </div>
      </div>

      <div data-row="10"></div>
    </div>
  )
}