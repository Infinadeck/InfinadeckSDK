import { findStorage } from 'browser/lib/findStorage'
import resolveStorageData from './resolveStorageData'
import resolveStorageNotes from './resolveStorageNotes'
import filenamify from 'filenamify'
import * as path from 'path'
import * as fs from 'fs'

/**
 * @param {String} storageKey
 * @param {String} folderKey
 * @param {String} fileType
 * @param {String} exportDir
 *
 * @return {Object}
 * ```
 * {
 *   storage: Object,
 *   folderKey: String,
 *   fileType: String,
 *   exportDir: String
 * }
 * ```
 */

function exportFolder (storageKey, folderKey, fileType, exportDir) {
  let targetStorage
  try {
    targetStorage = findStorage(storageKey)
  } catch (e) {
    return Promise.reject(e)
  }

  return resolveStorageData(targetStorage)
    .then(function assignNotes (storage) {
      return resolveStorageNotes(storage)
        .then((notes) => {
          return {
            storage,
            notes
          }
        })
    })
    .then(function exportNotes (data) {
      const { storage, notes } = data

      notes
        .filter(note => note.folder === folderKey && note.isTrashed === false && note.type === 'MARKDOWN_NOTE')
        .forEach(snippet => {
          const notePath = path.join(exportDir, `${filenamify(snippet.title, {replacement: '_'})}.${fileType}`)
          fs.writeFileSync(notePath, snippet.content)
        })

      return {
        storage,
        folderKey,
        fileType,
        exportDir
      }
    })
}

module.exports = exportFolder
