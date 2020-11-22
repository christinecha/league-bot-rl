require('dotenv').config()
require('regenerator-runtime/runtime')

const { discord } = require('../server/data/util/discord')
jest.mock('../server/data/util/discord')

discord.guilds.fetch.mockResolvedValue({
  id: 'h000',
  members: {
    fetch: () => Promise.resolve({
      id: 'cha',
      roles: {}
    })
  }
})