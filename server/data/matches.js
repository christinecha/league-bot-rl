const typeFactory = require('./util/typeFactory')

const factory = typeFactory('matches', {
  beforeCreate: async (data) => {
    return {
      ...data,
      timestamp: Date.now()
    }
  },
})

module.exports = factory