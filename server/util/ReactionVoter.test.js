const { ReactionVoter } = require('./ReactionVoter')

test('ReactionVoter', () => {
  const reactionVoter = new ReactionVoter()
  const users = ['user1', 'user2', 'user3']
  const options = ['option1', 'option2', 'option3']

  reactionVoter.recordVote({ userId: users[0], selection: options[0] })

  expect(reactionVoter.getWinner()).toBe(options[0])
  expect(reactionVoter.getWinner({ minVotes: 2 })).toBe(null)

  reactionVoter.recordVote({ userId: users[1], selection: options[0] })
  reactionVoter.recordVote({ userId: users[2], selection: options[1] })
  expect(reactionVoter.getWinner({ minVotes: 2 })).toBe(options[0])
})
