import { hashHistory } from 'react-router'
import dataApi from 'browser/main/lib/dataApi'
import ee from 'browser/main/lib/eventEmitter'
import AwsMobileAnalyticsConfig from 'browser/main/lib/AwsMobileAnalyticsConfig'

export function createMarkdownNote (storage, folder, dispatch, location) {
  AwsMobileAnalyticsConfig.recordDynamicCustomEvent('ADD_MARKDOWN')
  AwsMobileAnalyticsConfig.recordDynamicCustomEvent('ADD_ALLNOTE')
  return dataApi
    .createNote(storage, {
      type: 'MARKDOWN_NOTE',
      folder: folder,
      title: '',
      content: ''
    })
    .then(note => {
      const noteHash = note.key
      dispatch({
        type: 'UPDATE_NOTE',
        note: note
      })

      hashHistory.push({
        pathname: location.pathname,
        query: { key: noteHash }
      })
      ee.emit('list:jump', noteHash)
      ee.emit('detail:focus')
    })
}

export function createSnippetNote (storage, folder, dispatch, location, config) {
  AwsMobileAnalyticsConfig.recordDynamicCustomEvent('ADD_SNIPPET')
  AwsMobileAnalyticsConfig.recordDynamicCustomEvent('ADD_ALLNOTE')
  return dataApi
    .createNote(storage, {
      type: 'SNIPPET_NOTE',
      folder: folder,
      title: '',
      description: '',
      snippets: [
        {
          name: '',
          mode: config.editor.snippetDefaultLanguage || 'text',
          content: ''
        }
      ]
    })
    .then(note => {
      const noteHash = note.key
      dispatch({
        type: 'UPDATE_NOTE',
        note: note
      })
      hashHistory.push({
        pathname: location.pathname,
        query: { key: noteHash }
      })
      ee.emit('list:jump', noteHash)
      ee.emit('detail:focus')
    })
}
