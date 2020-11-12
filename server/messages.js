const Discord = require('discord.js')

const CREATE_MATCH = (match) => {
  const { players, teamSize } = match
  const team1 = Object.keys(players).filter(p => players[p].team === 1)
  const team2 = Object.keys(players).filter(p => players[p].team === 2)

  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${teamSize} Match!!!`)
    // .setURL('https://discord.js.org/')
    // .setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
    .setDescription(`id: ${match.id}`)
    // .setThumbnail('https://i.imgur.com/wSTFkRM.png')
    .addFields(
      { name: 'Team 1', value: team1.map(id => `<@!${id}>`).join(' ') },
      { name: 'Team 2', value: team2.map(id => `<@!${id}>`).join(' ') },
    )
    .setTimestamp()
    .setFooter('Some footer text here');
}

module.exports = {
  CREATE_MATCH
}