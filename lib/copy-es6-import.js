'use babel';

import { CompositeDisposable } from 'atom'
import { get, camelCase } from 'lodash'
import relative from 'relative'

const extractPath = (element) => {
  const path = element.dataset.path ? element.dataset.path : element.children[0].dataset.path
  const name = element.dataset.name ? element.dataset.name : element.children[0].dataset.name
  if (!path) {
    atom.notifications.addError(`
      copy-es6-import:
      unable to extract path from node.`)
    console.error("Unable to extract path from node: ", element)
  }

  return {
    path,
    name,
  }
}
const formatPath = (path) => {
  if (atom.config.get('copy-es6-import.replaceBackslashes')) {
    path = path.replace(/\\/g, "/")
  }
  return path
}
const stringifyPath = (path, delimiters) => `${delimiters}${path}${delimiters}`

module.exports = TreeViewCopyRelativePath = {
  SELECTOR: '.tree-view .file',
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
  copyRelativePath({ path, name}) {
    if (!path) return
    const STRING_DELIMITERS = atom.config.get('copy-es6-import.stringDelimiters')

    currentPath = get(atom.workspace.getActivePaneItem(), 'buffer.file.path')
    if (!currentPath) {
      atom.notifications.addWarning(`
        "Copy ES6 Import" command
        has no effect when no files are open`)
      return
    }

    const relativePath = relative(currentPath, path)
    const formattedPath = formatPath(relativePath)
    const stringifiedPath = stringifyPath(formattedPath, STRING_DELIMITERS)
    const camelizedName = camelCase(name)

    const importLine = `import ${camelizedName} from ${stringifiedPath}`

    atom.clipboard.write(importLine)
  },
}
