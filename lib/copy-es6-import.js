'use babel';

import { CompositeDisposable } from 'atom'
import { camelCase } from 'lodash'
import Path from 'path'

const extractPath = (element) => {
  const path = element.dataset.path ? element.dataset.path : element.children[0].dataset.path
  if (!path) {
    atom.notifications.addError(`
      copy-es6-import:
      unable to extract path from node.`)
    console.error("Unable to extract path from node: ", element)
  }

  return path
}
const formatPath = (path) => {
  if (atom.config.get('copy-es6-import.replaceBackslashes')) {
    path = path.replace(/\\/g, "/")
  }
  return path || '.'
}
const getDirPath = (path) => Path.parse(path).dir
const stringifyPath = (path, delimiters) => `${delimiters}${path}${delimiters}`

module.exports = TreeViewCopyRelativePath = {
  SELECTOR: 'atom-workspace',
  COMMAND: 'copy-es6-import:copy-path',
  subscriptions: null,
  config: {
    replaceBackslashes: {
      title: 'Replace backslashes (\\) with forward slashes (/) (usefull for Windows)',
      type: 'boolean',
      default: true,
    },
    stringDelimiters: {
      title: 'String delimiters',
      type: 'string',
      default: `'`,
    },
  },
  activate(state) {
    command = atom.commands.add(
      this.SELECTOR,
      this.COMMAND,
      ({target}) => this.copyRelativePath(extractPath(target))
    )

    this.subscriptions = new CompositeDisposable
    this.subscriptions.add(command)
  },
  deactivate() {
    this.subscriptions.dispose()
  },
  copyRelativePath(path) {
    if (!path) return
    const STRING_DELIMITERS = atom.config.get('copy-es6-import.stringDelimiters')
    currentPath = atom.workspace.getActiveTextEditor().getPath()
    if (!currentPath) {
      atom.notifications.addWarning(`
        "Copy ES6 Import" command
        has no effect when no files are open`)
      return
    }
    const { name, base } = Path.parse(path)
    const relativePath = Path.relative(getDirPath(currentPath), getDirPath(path))
    const formattedPath = formatPath(relativePath)
    const stringifiedPath = stringifyPath(`${formattedPath}/${base}`, STRING_DELIMITERS)
    const camelizedName = camelCase(name)

    const importLine = `import ${camelizedName} from ${stringifiedPath}`

    atom.clipboard.write(importLine)
  },
}
