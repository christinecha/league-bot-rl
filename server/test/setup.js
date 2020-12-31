require('dotenv').config()
require('regenerator-runtime/runtime')

const Discord = require('discord.js')
const users = require('./users')

jest.mock('discord.js')

Discord.DB = {
  users: {},
  guildMembers: {},
  guilds: {
    h000: {
      id: 'h000',
      name: 'Hooo Crew',
      ownerID: '12355',
      _members: {
        ...Object.keys(users).reduce((obj, key) => {
          const user = users[key]
          obj[user.id] = user
          return obj
        }, {}),
      },
    },
  },
}

Discord.Message = ({
  userId,
  content,
  channelId = 'test',
  guild,
  reactions = [],
}) => {
  const react = jest.fn()
  const send = jest.fn(() =>
    Promise.resolve({
      react,
      awaitReactions: async (filter) => {
        reactions.forEach((r) => {
          filter(...r)
        })
      },
    })
  )

  return {
    content,
    author: { id: userId },
    guild,
    channel: { send, id: channelId },
    react,
  }
}

Discord.Guild = jest.fn((data) => ({
  ...data,
  members: {
    fetch: (id) => {
      return Promise.resolve({
        user: {
          id,
          avatarURL: () => '',
        },
        hasPermission: (arr) =>
          arr.some((a) => {
            const perms = data._members[id].permissions || []
            return perms.includes(a)
          }),
        roles: data._members[id]
          ? {
              cache: data._members[id].roles,
            }
          : {},
      })
    },
  },
}))

Discord.Client = jest.fn(() => {
  const self = {
    /* Not real Discord methods */
    setUsers: (users) => (Discord.DB.users = users),
    callbacks: {},
    callbacksOnce: {},

    login: () => {},
    guilds: {
      fetch: (guildId) => {
        const guild = new Discord.Guild(Discord.DB.guilds[guildId])
        return Promise.resolve(guild)
      },
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
