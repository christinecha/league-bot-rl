const { getVariablesMarkdown } = require('../../shared/getVariablesMarkdown')
const {
  getCommandsMarkdown,
  getModCommandsMarkdown,
} = require('../../shared/getCommandsMarkdown')
const { getAdvancedMarkdown } = require('../../shared/getAdvancedMarkdown')

console.log('### Variables')
console.log('')
console.log(getVariablesMarkdown())
console.log('')
console.log('### Commands')
console.log('')
console.log(getCommandsMarkdown())
console.log('')
console.log('### Mod-Only Commands')
console.log('')
console.log(getModCommandsMarkdown())
console.log('')
console.log('### Advanced')
console.log('')
console.log(getAdvancedMarkdown())
