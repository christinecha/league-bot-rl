const { VARIABLES } = require('./commands')

const getVariablesMarkdown = () =>
  Object.values(VARIABLES)
    .filter((c) => !c.isHidden)
    .sort((a, b) => (a.name > b.name ? 1 : -1))
    .map((c) => {
      return `- \`${c.name}\` - ${c.description}`
    })
    .join('\n')

module.exports = {
  getVariablesMarkdown,
}
