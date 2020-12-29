require('dotenv').config()
require('regenerator-runtime/runtime')

const Discord = require('discord.js')
const { getLeagueStats } = require('../server/util/getLeagueStats')

jest.mock('../server/util/getLeagueStats')
getLeagueStats.mockResolvedValue({})

jest.mock('discord.js')

Discord.Client = jest.fn(() => {
  const self = {
    users: {},
    callbacks: {},
    callbacksOnce: {},
    login: () => {},
    guilds: {
      fetch: (guildId) =>
        Promise.resolve({
          id: guildId,
          members: {
            fetch: (userId) =>
              Promise.resolve({
                user: {
                  id: userId,
                  avatarURL: () => '',
                },
                roles: self.users[userId]
                  ? {
                      cache: self.users[userId].roles,
                    }
                  : {},
              }),
          },
        }),
    },
    trigger: function (evt, data) {
      if (!this.callbacks[evt]) return Promise.resolve()
      const promises = this.callbacks[evt].map((cb) => cb(data))
      return Promise.all(promises)
    },
    on: function (evt, callback) {
      this.callbacks[evt] = this.callbacks[evt] || []
      this.callbacks[evt].push(callback)
    },
    /* TODO: THESE SHOULD GET REMOVED... */
    once: function (evt, callback) {
      this.callbacksOnce[evt] = this.callbacksOnce[evt] || []
      this.callbacksOnce[evt].push(callback)
    },
  }

  return self
})

Discord.MessageEmbed = jest.fn(() => {
  return {
    fields: [],
    setColor: function () {
      return this
    },
    setTimestamp: function () {
      return this
    },
    setTitle: function (data) {
      this.title = data
      return this
    },
    setDescription: function (data) {
      this.description = data
      return this
    },
    addFields: function (...args) {
      args.forEach((arg) => {
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
