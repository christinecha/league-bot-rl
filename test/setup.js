require('dotenv').config()
require('regenerator-runtime/runtime')

const Discord = require('discord.js')
const { getLeagueStats } = require('../server/getLeagueStats')

jest.mock('../server/getLeagueStats')
getLeagueStats.mockResolvedValue({})

jest.mock('discord.js')

Discord.Client = jest.fn(() => {
  return {
    login: () => { },
    guilds: {
      fetch: jest.fn((guildId) => Promise.resolve({
        id: guildId,
        members: {
          fetch: (userId) => Promise.resolve({
            user: {
              id: userId,
            },
            roles: {}
          })
        }
      }))
    }
  }
})

Discord.MessageEmbed = jest.fn(() => {
  return {
    fields: [],
    setColor: function () { return this },
    setTimestamp: function () { return this },
    setTitle: function (data) {
      this.title = data
      return this
    },
    setDescription: function (data) {
      this.description = data
      return this
    },
    addFields: function (...args) {
      args.forEach(arg => {
        this.fields.push(arg)
      })
      return this
    },
    setFooter: function (data) {
      this.footer = data
      return this
    },
  }
})