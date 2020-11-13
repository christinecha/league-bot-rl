import axios from 'axios'

export const getMatches = ({ teamSize }) => (
  axios({
    method: 'POST',
    url: '/api/matches',
    data: {
      teamSize
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