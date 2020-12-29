const getRandom = (arr) => {
  const rand = Math.floor(Math.random() * arr.length)
  return arr[rand]
}

const getInsult = ({ userId, teamSize }) => {
  let insults = [
    `Was <@!${userId}> auditioning for Hamlet? Because that was one tragic performance.`,
    `<@!${userId}> - remember: ball goes in the other team's net.`,
    `<@!${userId}> bot confirmed??`,
    `<@!${userId}> sus.`,
    `Some questionable shots there, <@!${userId}>.`,
    `Did you forget to turn your monitor on, <@!${userId}>?`,
    `You're not supposed to fake *every* ball, <@!${userId}>.`,
    `<@!${userId}> is definitely mafia.`,
    `<@!${userId}> - we're not playing golf. The *HIGHER* score wins.`,
    `Don't be too hard on <@!${userId}>. I think they just picked up the game today.`,
    `You can stop throwing now, <@!${userId}>.`,
  ]

  if (teamSize !== undefined) {
    insults = insults.concat([
      `Tough luck, <@!${userId}>! ${teamSize - 1}v${
        teamSize + 1
      } is pretty hard.`,
      `It's supposed to be a ${teamSize}v${teamSize}, <@!${userId}>, not a ${
        teamSize - 1
      }v${teamSize + 1}.`,
    ])
  }

  return getRandom(insults)
}

const getCompliment = ({ userId }) => {
  const compliments = [
    `<@!${userId}> was absolutely *cracked* today.`,
    `Nothing gets past <@!${userId}>!`,
    `<@!${userId}> - next stop: RLCS.`,
    `See you at the top of the leaderboard, <@!${userId}>.`,
    `And <@!${userId}> wasn't even trying.`,
    `And that's why <@!${userId}> = the best.`,
    `<@!${userId}> is a legend!!`,
    `<@!${userId}> officially goated.`,
  ]

  return getRandom(compliments)
}

module.exports = {
  getInsult,
  getCompliment,
}
