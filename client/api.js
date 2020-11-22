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

export const getStats = ({ leagueId }) => (
  axios({
    method: 'POST',
    url: '/api/stats',
    data: {
      leagueId
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

export const getGuild = ({ guildId }) => (
  axios({
    method: 'POST',
    url: '/api/guild',
    data: {
      id: guildId
    }
  })
)