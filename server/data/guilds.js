const typeFactory = require('./util/typeFactory')

const factory = typeFactory('guilds', {
  beforeCreate: async (data) => {
    return {
      ...data,
      timestamp: Date.now(),
    }
  },
})

module.exports = factory
