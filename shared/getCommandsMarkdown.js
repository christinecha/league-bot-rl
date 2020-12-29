const { COMMANDS } = require('./commands')

const getCommandsMarkdown = () =>
  Object.values(COMMANDS)
    .filter((c) => !c.isHidden)
    .sort((a, b) => (a.command > b.command ? 1 : -1))
    .map((c) => {
      const aliases =
        c.aliases && c.aliases.length ? ` | ${c.aliases.join(' | ')}` : ''

      const args = c.argument ? ` <${c.argument}>` : ''
      return `- \`@LeagueBot ${c.command}${aliases}${args}\` - ${c.description}`
    })
    .join('\n')

module.exports = {
  getCommandsMarkdown,
}
