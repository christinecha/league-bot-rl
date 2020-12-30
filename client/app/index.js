import 'seasalt/dist/index.css'

import React from 'react'
import qs from 'qs'
import { Global, css as globalcss } from '@emotion/react'
import { Leaderboard } from './Leaderboard'
import { Home } from './Home'
import COLORS from '../../shared/COLORS'

const { guildId } = qs.parse(window.location.search, {
  ignoreQueryPrefix: true,
})

const App = () => {
  return (
    <main>
      <Global
        styles={globalcss`
          body {
            background: #100e0c;
            color: white;
            padding-top: 30px;
          }

          * {
            font-family: 'DM Mono', sans-serif;
          }

          :root {
            --page-margin: 20px;
            --row-max-width: 850px;
            --row-height: 0.2rem;
          }

          h3 {
            margin-bottom: 0.2rem;
          }

          a {
            color: inherit;
            cursor: pointer;
            text-decoration: none;
            border-bottom: 1px solid currentColor;

            &:hover {
              color: ${COLORS.PINK};
            }
          }

          button {
            border: none;
            color: inherit;
            outline: none;
            background: inherit;
            cursor: pointer;
          }
        `}
      />

      {guildId ? <Leaderboard /> : <Home />}
    </main>
  )
}

export default App
