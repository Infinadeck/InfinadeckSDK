/**
 * @fileoverview Markdown table of contents generator
 */

import toc from 'markdown-toc'
import diacritics from 'diacritics-map'
import stripColor from 'strip-color'

const EOL = require('os').EOL

/**
 * @caseSensitiveSlugify Custom slugify function
 * Same implementation that the original used by markdown-toc (node_modules/markdown-toc/lib/utils.js),
 * but keeps original case to properly handle https://github.com/BoostIO/Boostnote/issues/2067
 */
function caseSensitiveSlugify (str) {
  function replaceDiacritics (str) {
    return str.replace(/[À-ž]/g, function (ch) {
      return diacritics[ch] || ch
    })
  }

  function getTitle (str) {
    if (/^\[[^\]]+\]\(/.test(str)) {
      var m = /^\[([^\]]+)\]/.exec(str)
      if (m) return m[1]
    }
    return str
  }

  str = getTitle(str)
  str = stripColor(str)
  // str = str.toLowerCase() //let's be case sensitive

  // `.split()` is often (but not always) faster than `.replace()`
  str = str.split(' ').join('-')
  str = str.split(/\t/).join('--')
  str = str.split(/<\/?[^>]+>/).join('')
  str = str.split(/[|$&`~=\\\/@+*!?({[\]})<>=.,;:'"^]/).join('')
  str = str.split(/[。？！，、；：“”【】（）〔〕［］﹃﹄“ ”‘’﹁﹂—…－～《》〈〉「」]/).join('')
  str = replaceDiacritics(str)
  return str
}

const TOC_MARKER_START = '<!-- toc -->'
const TOC_MARKER_END = '<!-- tocstop -->'

/**
 * Takes care of proper updating given editor with TOC.
 * If TOC doesn't exit in the editor, it's inserted at current caret position.
 * Otherwise,TOC is updated in place.
 * @param editor CodeMirror editor to be updated with TOC
 */
export function generateInEditor (editor) {
  const tocRegex = new RegExp(`${TOC_MARKER_START}[\\s\\S]*?${TOC_MARKER_END}`)

  function tocExistsInEditor () {
    return tocRegex.test(editor.getValue())
  }

  function updateExistingToc () {
    const toc = generate(editor.getValue())
    const search = editor.getSearchCursor(tocRegex)
    while (search.findNext()) {
      search.replace(toc)
    }
  }

  function addTocAtCursorPosition () {
    const toc = generate(editor.getRange(editor.getCursor(), {line: Infinity}))
    editor.replaceRange(wrapTocWithEol(toc, editor), editor.getCursor())
  }

  if (tocExistsInEditor()) {
    updateExistingToc()
  } else {
    addTocAtCursorPosition()
  }
}

/**
 * Generates MD TOC based on MD document passed as string.
 * @param markdownText MD document
 * @returns generatedTOC String containing generated TOC
 */
export function generate (markdownText) {
  const generatedToc = toc(markdownText, {slugify: caseSensitiveSlugify})
  return TOC_MARKER_START + EOL + EOL + generatedToc.content + EOL + EOL + TOC_MARKER_END
}

function wrapTocWithEol (toc, editor) {
  const leftWrap = editor.getCursor().ch === 0 ? '' : EOL
  const rightWrap = editor.getLine(editor.getCursor().line).length === editor.getCursor().ch ? '' : EOL
  return leftWrap + toc + rightWrap
}

export default {
  generate,
  generateInEditor
}
