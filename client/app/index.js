import 'seasalt/dist/index.css'

import React from 'react'
import qs from 'qs'
import { Global, css as globalcss } from '@emotion/react'
import { Leaderboard } from './Leaderboard'
import { Home } from './Home'

const { guildId, teamSize } = qs.parse(window.location.search, { ignoreQueryPrefix: true })

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
            font-family: 'DM Mono', monospace;
          }

          main {
            width: 90%;
            max-width: 850px;
            margin: auto;
          }
        `}
      />

      {guildId ? <Leaderboard /> : <Home />}
    </main>
  )
}

export default App