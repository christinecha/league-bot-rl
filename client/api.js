import axios from 'axios'

export const getMatches = ({ teamSize, league }) => (
  axios({
    method: 'POST',
    url: '/api/matches',
    data: {
      teamSize,
      league
    }
  })
)

export const getGuildUser = ({ userId, guildId }) => (
  axios({
    method: 'POST',
    url: '/api/guild-user',
    data: {
      userId,
      guildId
    }
  })
)