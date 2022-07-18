require('dotenv').config()
require('regenerator-runtime/runtime')

const Discord = require('discord.js')
const users = require('./users')

jest.mock('discord.js')

Discord.Channel = (data) => {
  const react = jest.fn()
  const self = {
    reactions: [],
    ...data,
    send: jest.fn(() =>
      Promise.resolve({
        react,
        awaitReactions: ({ filter }) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              self.reactions.forEach((r) => {
                filter(...r)
              })
              resolve()
            }, 10)
          })
        },
      })
    ),
    setReactions: (r) => {
      self.reactions = r
    },
    react,
  }

  return self
}

Discord.DB = {
  users: {},
  guildMembers: {},
  guilds: {
    h000: {
      id: 'h000',
      name: 'Hooo Crew',
      ownerId: '12355',
      _members: {
        ...Object.keys(users).reduce((obj, key) => {
          const user = users[key]
          obj[user.id] = user
          return obj
        }, {}),
      },
    },
  },
  channels: {
    test: new Discord.Channel({ id: 'test', guild: { id: 'h000' } }),
  },
}

Discord.Message = ({
  userId,
  content,
  channelId = 'test',
  guild,
  reactions = [],
}) => {
  const channel = Discord.DB.channels[channelId]
  channel.setReactions(reactions)

  return {
    content,
    author: { id: userId },
    guild,
    channel,
    react: channel.react,
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
    trigger: function (evt, data) {
      if (!this.callbacks[evt]) return Promise.resolve()
      const promises = this.callbacks[evt].map((cb) => cb(data))
      return Promise.all(promises)
    },

    login: () => { },
    guilds: {
      fetch: (guildId) => {
        const guild = new Discord.Guild(Discord.DB.guilds[guildId])
        return Promise.resolve(guild)
      },
    },
    channels: {
      fetch: (id) => {
        const channel = Discord.DB.channels[id]
        return Promise.resolve(channel)
      },
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
    addField: function (...args) {
      this.fields.push({ name: args[0], value: args[1] })
      return this
    },
    setFooter: function (data) {
      this.footer = data
      return this
    },
  }
})
