class ReactionVoter {
  constructor() {
    this.votes = {}
  }

  getWinner(props = { minVotes: 1 }) {
    const options = {}

    Object.values(this.votes).forEach((option) => {
      options[option] = options[option] || 0
      options[option] += 1
    })

    const optionsArray = Object.entries(options).map(([option, votes]) => ({
      option,
      votes,
    }))
    const sortedOptions = optionsArray.sort((a, b) => b.votes - a.votes)
    const mostPopular = sortedOptions[0]

    if (!mostPopular) return null
    if (mostPopular.votes < props.minVotes) return null
    return mostPopular.option
  }

  recordVote({ userId, selection }) {
    this.votes[userId] = selection
  }
}

module.exports = { ReactionVoter }
