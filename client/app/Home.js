import React from 'react'
import ReactMarkdown from 'react-markdown'
import styled from '@emotion/styled'
import { css } from '@emotion/css'
import {
  getCommandsMarkdown,
  getModCommandsMarkdown,
} from '../../shared/getCommandsMarkdown'
import COLORS from '../../shared/COLORS'
import { getAdvancedMarkdown } from '../../shared/getAdvancedMarkdown'
import { getVariablesMarkdown } from '../../shared/getVariablesMarkdown'

const StyledButton = styled.button`
  border-radius: 4px;
  background: ${COLORS.PINK};
  color: white;
  text-transform: uppercase;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1;
  font-weight: bold;
  margin-top: 1rem;

  &:hover {
    background: ${COLORS.BLUE};
  }
`

const StyledMarkdown = styled.div`
  background: ${COLORS.GRAY};
  padding: 1rem;
  border-radius: 5px;

  ul {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }

  li {
    margin-bottom: 0.6rem;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  h3 {
    margin-bottom: 0.6rem;
  }
`

const StyledLink = styled.a`
  display: inline-block;
  margin-bottom: 0.3rem;
`

export const Home = () => {
  return (
    <div>
      <div data-row={6} />
      <div data-row>
        <div
          data-col="12"
          className={css`
            text-align: center;
          `}
        >
          <img
            className={css`
              width: 9rem;
              border-radius: 100%;
            `}
            src="/assets/league-bot-avatar.png"
            alt="League Bot Avatar"
          />
          <p
            className={css`
              max-width: 500px;
              margin: auto;
              margin-top: 1rem;
            `}
          >
            An open-source Discord bot to help manage Rocket League leaderboards
            within your&nbsp;server.
          </p>
          <a
            target="_blank"
            href="https://discord.com/oauth2/authorize?client_id=775129640322203658&scope=bot"
          >
            <StyledButton>Add it to my server</StyledButton>
          </a>
          <br />
          <a
            target="_blank"
            href="https://github.com/christinecha/league-bot-rl"
            className={css`
              display: inline-block;
              margin-top: 1rem;
              font-size: 0.9rem;
            `}
          >
            View Source →
          </a>
          <br />
          <a
            target="_blank"
            href="https://www.twitch.tv/chaistyping"
            className={css`
              display: inline-block;
              margin-top: 0.5rem;
              font-size: 0.9rem;
            `}
          >
            Live Coding on Twitch →
          </a>
          <br />
          <a
            target="_blank"
            href="https://discord.gg/phpkY4NaY7"
            className={css`
              display: inline-block;
              margin-top: 0.5rem;
              font-size: 0.9rem;
            `}
          >
            Discord Community →
          </a>
        </div>
      </div>
      <div data-row="10"></div>

      <div data-row>
        <div data-col="12">
          <h3>Getting Started:</h3>
          <ul>
            <li>Add the bot to your server using the button above.</li>
            <li>
              In any channel, send a message with <code>@LeagueBot new X</code>{' '}
              once for each league you want to add (replace X with the team size
              - 1, 2, or 3).
            </li>
            <li>
              All set! Send <code>@LeagueBot queue X</code> to queue up.
            </li>
          </ul>
        </div>
      </div>

      <div data-row="6"></div>

      <div data-row>
        <div data-col="12">
          <StyledMarkdown>
            <ReactMarkdown>
              {`### Variables
${getVariablesMarkdown()}  
&nbsp;  
### Commands
${getCommandsMarkdown()}  
&nbsp;  
### Mod-Only Commands
${getModCommandsMarkdown()}  
&nbsp;  
### Advanced
${getAdvancedMarkdown()}
`}
            </ReactMarkdown>
          </StyledMarkdown>
        </div>
      </div>

      <div data-row="6"></div>

      <div data-row>
        <div data-col="12">
          <h3>About</h3>
          <p>
            This project has been a fun way to give back to the Rocket League
            community, with the intention of delivering a solidly built,
            full-featured Discord bot. It's 100% free and open source, and I
            intend to keep it that way.
            <br />
            <br />
            If you'd like to help support the development and maintenance of
            this project, you can{' '}
            <a href="https://github.com/sponsors/christinecha" target="_blank">
              become a Github Sponsor
            </a>{' '}
            or just drop by my Twitch stream.
            <br />
            <br />- Cha ✌️
            <br />
            <br />
            P.S. Special shout out to{' '}
            <a href="https://twitch.tv/hoodyhooo" target="_blank">
              Hoodyhooo
            </a>{' '}
            for giving me a community to build this for!
          </p>
          <br />
          <div
            className={css`
              display: flex;
              flex-direction: column;
              align-items: flex-start;
            `}
          >
            <StyledLink href="https://github.com/christinecha" target="_blank">
              Github
            </StyledLink>
            <StyledLink
              href="https://www.twitch.tv/chaistyping"
              target="_blank"
            >
              Twitch
            </StyledLink>
            <StyledLink
              href="https://www.twitter.com/madebycha"
              target="_blank"
            >
              Twitter
            </StyledLink>
          </div>
        </div>
      </div>

      <div data-row="20"></div>
    </div>
  )
}
