require('dotenv').config()
require('regenerator-runtime/runtime')

const Discord = require('discord.js')

jest.mock('discord.js')

Discord.DB = {
  users: {},
  guilds: {
    h000: {
      id: 'h000',
      name: 'Hooo Crew',
      ownerID: '12355',
    },
  },
}

Discord.Message = jest.fn(({ userId, content }) => ({
  content,
  author: { id: userId },
  guild,
  channel: { send, id: '55' },
}))

Discord.Client = jest.fn(() => {
  const self = {
    /* Not real Discord methods */
    setUsers: (users) => (Discord.DB.users = users),
    callbacks: {},
    callbacksOnce: {},

    login: () => {},
    guilds: {
      fetch: (guildId) =>
        Promise.resolve({
          ...Discord.DB.guilds[guildId],
          members: {
            fetch: (userId) =>
              Promise.resolve({
                user: {
                  id: userId,
                  avatarURL: () => '',
                },
                hasPermission: (arr) =>
                  arr.some((a) => {
                    const perms = Discord.DB.users[userId].permissions || []
                    return perms.includes(a)
                  }),
                roles: Discord.DB.users[userId]
                  ? {
                      cache: Discord.DB.users[userId].roles,
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
