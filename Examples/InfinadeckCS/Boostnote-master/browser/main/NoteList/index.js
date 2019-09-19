/* global electron */
import PropTypes from 'prop-types'
import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import debounceRender from 'react-debounce-render'
import styles from './NoteList.styl'
import moment from 'moment'
import _ from 'lodash'
import ee from 'browser/main/lib/eventEmitter'
import dataApi from 'browser/main/lib/dataApi'
import attachmentManagement from 'browser/main/lib/dataApi/attachmentManagement'
import ConfigManager from 'browser/main/lib/ConfigManager'
import NoteItem from 'browser/components/NoteItem'
import NoteItemSimple from 'browser/components/NoteItemSimple'
import searchFromNotes from 'browser/lib/search'
import fs from 'fs'
import path from 'path'
import { hashHistory } from 'react-router'
import copy from 'copy-to-clipboard'
import AwsMobileAnalyticsConfig from 'browser/main/lib/AwsMobileAnalyticsConfig'
import Markdown from '../../lib/markdown'
import i18n from 'browser/lib/i18n'
import { confirmDeleteNote } from 'browser/lib/confirmDeleteNote'
import context from 'browser/lib/context'

const { remote } = require('electron')
const { dialog } = remote
const WP_POST_PATH = '/wp/v2/posts'

function sortByCreatedAt (a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt)
}

function sortByAlphabetical (a, b) {
  return a.title.localeCompare(b.title)
}

function sortByUpdatedAt (a, b) {
  return new Date(b.updatedAt) - new Date(a.updatedAt)
}

function findNoteByKey (notes, noteKey) {
  return notes.find((note) => note.key === noteKey)
}

function findNotesByKeys (notes, noteKeys) {
  return notes.filter((note) => noteKeys.includes(getNoteKey(note)))
}

function getNoteKey (note) {
  return note.key
}

class NoteList extends React.Component {
  constructor (props) {
    super(props)

    this.selectNextNoteHandler = () => {
      console.log('fired next')
      this.selectNextNote()
    }
    this.selectPriorNoteHandler = () => {
      this.selectPriorNote()
    }
    this.focusHandler = () => {
      this.refs.list.focus()
    }
    this.alertIfSnippetHandler = () => {
      this.alertIfSnippet()
    }
    this.importFromFileHandler = this.importFromFile.bind(this)
    this.jumpNoteByHash = this.jumpNoteByHashHandler.bind(this)
    this.handleNoteListKeyUp = this.handleNoteListKeyUp.bind(this)
    this.getNoteKeyFromTargetIndex = this.getNoteKeyFromTargetIndex.bind(this)
    this.deleteNote = this.deleteNote.bind(this)
    this.focusNote = this.focusNote.bind(this)
    this.pinToTop = this.pinToTop.bind(this)
    this.getNoteStorage = this.getNoteStorage.bind(this)
    this.getNoteFolder = this.getNoteFolder.bind(this)
    this.getViewType = this.getViewType.bind(this)
    this.restoreNote = this.restoreNote.bind(this)
    this.copyNoteLink = this.copyNoteLink.bind(this)
    this.navigate = this.navigate.bind(this)

    // TODO: not Selected noteKeys but SelectedNote(for reusing)
    this.state = {
      shiftKeyDown: false,
      selectedNoteKeys: []
    }

    this.contextNotes = []
  }

  componentDidMount () {
    this.refreshTimer = setInterval(() => this.forceUpdate(), 60 * 1000)
    ee.on('list:next', this.selectNextNoteHandler)
    ee.on('list:prior', this.selectPriorNoteHandler)
    ee.on('list:focus', this.focusHandler)
    ee.on('list:isMarkdownNote', this.alertIfSnippetHandler)
    ee.on('import:file', this.importFromFileHandler)
    ee.on('list:jump', this.jumpNoteByHash)
    ee.on('list:navigate', this.navigate)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.resetScroll()
    }
  }

  resetScroll () {
    this.refs.list.scrollTop = 0
  }

  componentWillUnmount () {
    clearInterval(this.refreshTimer)

    ee.off('list:next', this.selectNextNoteHandler)
    ee.off('list:prior', this.selectPriorNoteHandler)
    ee.off('list:focus', this.focusHandler)
    ee.off('list:isMarkdownNote', this.alertIfSnippetHandler)
    ee.off('import:file', this.importFromFileHandler)
    ee.off('list:jump', this.jumpNoteByHash)
  }

  componentDidUpdate (prevProps) {
    const { location } = this.props
    const { selectedNoteKeys } = this.state
    const visibleNoteKeys = this.notes.map(note => note.key)
    const note = this.notes[0]
    const prevKey = prevProps.location.query.key
    const noteKey = visibleNoteKeys.includes(prevKey) ? prevKey : note && note.key

    if (note && location.query.key == null) {
      const { router } = this.context
      if (!location.pathname.match(/\/searched/)) this.contextNotes = this.getContextNotes()

      // A visible note is an active note
      if (!selectedNoteKeys.includes(noteKey)) {
        if (selectedNoteKeys.length === 1) selectedNoteKeys.pop()
        selectedNoteKeys.push(noteKey)
        ee.emit('list:moved')
      }

      router.replace({
        pathname: location.pathname,
        query: {
          key: noteKey
        }
      })
      return
    }

    // Auto scroll
    if (_.isString(location.query.key) && prevProps.location.query.key === location.query.key) {
      const targetIndex = this.getTargetIndex()
      if (targetIndex > -1) {
        const list = this.refs.list
        const item = list.childNodes[targetIndex]

        if (item == null) return false

        const overflowBelow = item.offsetTop + item.clientHeight - list.clientHeight - list.scrollTop > 0
        if (overflowBelow) {
          list.scrollTop = item.offsetTop + item.clientHeight - list.clientHeight
        }
        const overflowAbove = list.scrollTop > item.offsetTop
        if (overflowAbove) {
          list.scrollTop = item.offsetTop
        }
      }
    }
  }

  focusNote (selectedNoteKeys, noteKey) {
    const { router } = this.context
    const { location } = this.props

    this.setState({
      selectedNoteKeys
    })

    router.push({
      pathname: location.pathname,
      query: {
        key: noteKey
      }
    })
  }

  getNoteKeyFromTargetIndex (targetIndex) {
    const note = Object.assign({}, this.notes[targetIndex])
    const noteKey = getNoteKey(note)
    return noteKey
  }

  selectPriorNote () {
    if (this.notes == null || this.notes.length === 0) {
      return
    }
    let { selectedNoteKeys } = this.state
    const { shiftKeyDown } = this.state

    let targetIndex = this.getTargetIndex()

    if (targetIndex === 0) {
      return
    }
    targetIndex--

    if (!shiftKeyDown) { selectedNoteKeys = [] }
    const priorNoteKey = this.getNoteKeyFromTargetIndex(targetIndex)
    if (selectedNoteKeys.includes(priorNoteKey)) {
      selectedNoteKeys.pop()
    } else {
      selectedNoteKeys.push(priorNoteKey)
    }

    this.focusNote(selectedNoteKeys, priorNoteKey)

    ee.emit('list:moved')
  }

  selectNextNote () {
    if (this.notes == null || this.notes.length === 0) {
      return
    }
    let { selectedNoteKeys } = this.state
    const { shiftKeyDown } = this.state

    let targetIndex = this.getTargetIndex()
    const isTargetLastNote = targetIndex === this.notes.length - 1

    if (isTargetLastNote && shiftKeyDown) {
      return
    } else if (isTargetLastNote) {
      targetIndex = 0
    } else {
      targetIndex++
      if (targetIndex < 0) targetIndex = 0
      else if (targetIndex > this.notes.length - 1) targetIndex = this.notes.length - 1
    }

    if (!shiftKeyDown) { selectedNoteKeys = [] }
    const nextNoteKey = this.getNoteKeyFromTargetIndex(targetIndex)
    if (selectedNoteKeys.includes(nextNoteKey)) {
      selectedNoteKeys.pop()
    } else {
      selectedNoteKeys.push(nextNoteKey)
    }

    this.focusNote(selectedNoteKeys, nextNoteKey)

    ee.emit('list:moved')
  }

  jumpNoteByHashHandler (event, noteHash) {
    // first argument event isn't used.
    if (this.notes === null || this.notes.length === 0) {
      return
    }

    const selectedNoteKeys = [noteHash]
    this.focusNote(selectedNoteKeys, noteHash)

    ee.emit('list:moved')
  }

  handleNoteListKeyDown (e) {
    if (e.metaKey || e.ctrlKey) return true

    // A key
    if (e.keyCode === 65 && !e.shiftKey) {
      e.preventDefault()
      ee.emit('top:new-note')
    }

    // D key
    if (e.keyCode === 68) {
      e.preventDefault()
      this.deleteNote()
    }

    // E key
    if (e.keyCode === 69) {
      e.preventDefault()
      ee.emit('detail:focus')
    }

    // L or S key
    if (e.keyCode === 76 || e.keyCode === 83) {
      e.preventDefault()
      ee.emit('top:focus-search')
    }

    // UP or K key
    if (e.keyCode === 38 || e.keyCode === 75) {
      e.preventDefault()
      this.selectPriorNote()
    }

    // DOWN or J key
    if (e.keyCode === 40 || e.keyCode === 74) {
      e.preventDefault()
      this.selectNextNote()
    }

    if (e.shiftKey) {
      this.setState({ shiftKeyDown: true })
    }
  }

  handleNoteListKeyUp (e) {
    if (!e.shiftKey) {
      this.setState({ shiftKeyDown: false })
    }
  }

  getNotes () {
    const { data, params, location } = this.props

    if (location.pathname.match(/\/home/) || location.pathname.match(/alltags/)) {
      const allNotes = data.noteMap.map((note) => note)
      this.contextNotes = allNotes
      return allNotes
    }

    if (location.pathname.match(/\/starred/)) {
      const starredNotes = data.starredSet.toJS().map((uniqueKey) => data.noteMap.get(uniqueKey))
      this.contextNotes = starredNotes
      return starredNotes
    }

    if (location.pathname.match(/\/searched/)) {
      const searchInputText = params.searchword
      const allNotes = data.noteMap.map((note) => note)
      this.contextNotes = allNotes
      if (searchInputText === undefined || searchInputText === '') {
        return this.sortByPin(this.contextNotes)
      }
      return searchFromNotes(this.contextNotes, searchInputText)
    }

    if (location.pathname.match(/\/trashed/)) {
      const trashedNotes = data.trashedSet.toJS().map((uniqueKey) => data.noteMap.get(uniqueKey))
      this.contextNotes = trashedNotes
      return trashedNotes
    }

    if (location.pathname.match(/\/tags/)) {
      const listOfTags = params.tagname.split(' ')
      return data.noteMap.map(note => {
        return note
      }).filter(note => listOfTags.every(tag => note.tags.includes(tag)))
    }

    return this.getContextNotes()
  }

  // get notes in the current folder
  getContextNotes () {
    const { data, params } = this.props
    const storageKey = params.storageKey
    const folderKey = params.folderKey
    const storage = data.storageMap.get(storageKey)
    if (storage === undefined) return []

    const folder = _.find(storage.folders, {key: folderKey})
    if (folder === undefined) {
      const storageNoteSet = data.storageNoteMap.get(storage.key) || []
      return storageNoteSet.map((uniqueKey) => data.noteMap.get(uniqueKey))
    }

    const folderNoteKeyList = data.folderNoteMap.get(`${storage.key}-${folder.key}`) || []
    return folderNoteKeyList.map((uniqueKey) => data.noteMap.get(uniqueKey))
  }

  sortByPin (unorderedNotes) {
    const pinnedNotes = []
    const unpinnedNotes = []

    unorderedNotes.forEach((note) => {
      if (note.isPinned) {
        pinnedNotes.push(note)
      } else {
        unpinnedNotes.push(note)
      }
    })

    return pinnedNotes.concat(unpinnedNotes)
  }

  handleNoteClick (e, uniqueKey) {
    const { router } = this.context
    const { location } = this.props
    let { selectedNoteKeys } = this.state
    const { shiftKeyDown } = this.state

    if (shiftKeyDown && selectedNoteKeys.includes(uniqueKey)) {
      const newSelectedNoteKeys = selectedNoteKeys.filter((noteKey) => noteKey !== uniqueKey)
      this.setState({
        selectedNoteKeys: newSelectedNoteKeys
      })
      return
    }
    if (!shiftKeyDown) {
      selectedNoteKeys = []
    }
    selectedNoteKeys.push(uniqueKey)
    this.setState({
      selectedNoteKeys
    })

    router.push({
      pathname: location.pathname,
      query: {
        key: uniqueKey
      }
    })
  }

  handleSortByChange (e) {
    const { dispatch, params: { folderKey } } = this.props

    const config = {
      [folderKey]: { sortBy: e.target.value }
    }

    ConfigManager.set(config)
    dispatch({
      type: 'SET_CONFIG',
      config
    })
  }

  handleListStyleButtonClick (e, style) {
    const { dispatch } = this.props

    const config = {
      listStyle: style
    }

    ConfigManager.set(config)
    dispatch({
      type: 'SET_CONFIG',
      config
    })
  }

  alertIfSnippet () {
    const targetIndex = this.getTargetIndex()
    if (this.notes[targetIndex].type === 'SNIPPET_NOTE') {
      dialog.showMessageBox(remote.getCurrentWindow(), {
        type: 'warning',
        message: i18n.__('Sorry!'),
        detail: i18n.__('md/text import is available only a markdown note.'),
        buttons: [i18n.__('OK'), i18n.__('Cancel')]
      })
    }
  }

  handleDragStart (e, note) {
    let { selectedNoteKeys } = this.state
    const noteKey = getNoteKey(note)

    if (!selectedNoteKeys.includes(noteKey)) {
      selectedNoteKeys = []
      selectedNoteKeys.push(noteKey)
    }

    const notes = this.notes.map((note) => Object.assign({}, note))
    const selectedNotes = findNotesByKeys(notes, selectedNoteKeys)
    const noteData = JSON.stringify(selectedNotes)
    e.dataTransfer.setData('note', noteData)
    this.selectNextNote()
  }

  handleNoteContextMenu (e, uniqueKey) {
    const { location } = this.props
    const { selectedNoteKeys } = this.state
    const note = findNoteByKey(this.notes, uniqueKey)
    const noteKey = getNoteKey(note)

    if (selectedNoteKeys.length === 0 || !selectedNoteKeys.includes(noteKey)) {
      this.handleNoteClick(e, uniqueKey)
    }

    const pinLabel = note.isPinned ? i18n.__('Remove pin') : i18n.__('Pin to Top')
    const deleteLabel = i18n.__('Delete Note')
    const cloneNote = i18n.__('Clone Note')
    const restoreNote = i18n.__('Restore Note')
    const copyNoteLink = i18n.__('Copy Note Link')
    const publishLabel = i18n.__('Publish Blog')
    const updateLabel = i18n.__('Update Blog')
    const openBlogLabel = i18n.__('Open Blog')

    const templates = []

    if (location.pathname.match(/\/trash/)) {
      templates.push({
        label: restoreNote,
        click: this.restoreNote
      }, {
        label: deleteLabel,
        click: this.deleteNote
      })
    } else {
      if (!location.pathname.match(/\/starred/)) {
        templates.push({
          label: pinLabel,
          click: this.pinToTop
        })
      }
      templates.push({
        label: deleteLabel,
        click: this.deleteNote
      }, {
        label: cloneNote,
        click: this.cloneNote.bind(this)
      }, {
        label: copyNoteLink,
        click: this.copyNoteLink(note)
      })
      if (note.type === 'MARKDOWN_NOTE') {
        if (note.blog && note.blog.blogLink && note.blog.blogId) {
          templates.push({
            label: updateLabel,
            click: this.publishMarkdown.bind(this)
          }, {
            label: openBlogLabel,
            click: () => this.openBlog.bind(this)(note)
          })
        } else {
          templates.push({
            label: publishLabel,
            click: this.publishMarkdown.bind(this)
          })
        }
      }
    }
    context.popup(templates)
  }

  updateSelectedNotes (updateFunc, cleanSelection = true) {
    const { selectedNoteKeys } = this.state
    const { dispatch } = this.props
    const notes = this.notes.map((note) => Object.assign({}, note))
    const selectedNotes = findNotesByKeys(notes, selectedNoteKeys)

    if (!_.isFunction(updateFunc)) {
      console.warn('Update function is not defined. No update will happen')
      updateFunc = (note) => { return note }
    }

    Promise.all(
        selectedNotes.map((note) => {
          note = updateFunc(note)
          return dataApi
              .updateNote(note.storage, note.key, note)
        })
    )
        .then((updatedNotes) => {
          updatedNotes.forEach((note) => {
            dispatch({
              type: 'UPDATE_NOTE',
              note
            })
          })
        })

    if (cleanSelection) {
      this.selectNextNote()
    }
  }

  pinToTop () {
    this.updateSelectedNotes((note) => {
      note.isPinned = !note.isPinned
      return note
    })
  }

  restoreNote () {
    this.updateSelectedNotes((note) => {
      note.isTrashed = false
      return note
    })
  }

  deleteNote () {
    const { dispatch } = this.props
    const { selectedNoteKeys } = this.state
    const notes = this.notes.map((note) => Object.assign({}, note))
    const selectedNotes = findNotesByKeys(notes, selectedNoteKeys)
    const firstNote = selectedNotes[0]
    const { confirmDeletion } = this.props.config.ui

    if (firstNote.isTrashed) {
      if (!confirmDeleteNote(confirmDeletion, true)) return

      Promise.all(
        selectedNotes.map((note) => {
          return dataApi
            .deleteNote(note.storage, note.key)
        })
      )
      .then((data) => {
        data.forEach((item) => {
          dispatch({
            type: 'DELETE_NOTE',
            storageKey: item.storageKey,
            noteKey: item.noteKey
          })
        })
      })
      .catch((err) => {
        console.error('Cannot Delete note: ' + err)
      })
      console.log('Notes were all deleted')
    } else {
      if (!confirmDeleteNote(confirmDeletion, false)) return

      Promise.all(
        selectedNotes.map((note) => {
          note.isTrashed = true

          return dataApi
          .updateNote(note.storage, note.key, note)
        })
      )
      .then((newNotes) => {
        newNotes.forEach((newNote) => {
          dispatch({
            type: 'UPDATE_NOTE',
            note: newNote
          })
        })
        AwsMobileAnalyticsConfig.recordDynamicCustomEvent('EDIT_NOTE')
        console.log('Notes went to trash')
      })
      .catch((err) => {
        console.error('Notes could not go to trash: ' + err)
      })
    }
    this.setState({ selectedNoteKeys: [] })
  }

  cloneNote () {
    const { selectedNoteKeys } = this.state
    const { dispatch, location } = this.props
    const { storage, folder } = this.resolveTargetFolder()
    const notes = this.notes.map((note) => Object.assign({}, note))
    const selectedNotes = findNotesByKeys(notes, selectedNoteKeys)
    const firstNote = selectedNotes[0]
    const eventName = firstNote.type === 'MARKDOWN_NOTE' ? 'ADD_MARKDOWN' : 'ADD_SNIPPET'

    AwsMobileAnalyticsConfig.recordDynamicCustomEvent(eventName)
    AwsMobileAnalyticsConfig.recordDynamicCustomEvent('ADD_ALLNOTE')
    dataApi
      .createNote(storage.key, {
        type: firstNote.type,
        folder: folder.key,
        title: firstNote.title + ' ' + i18n.__('copy'),
        content: firstNote.content
      })
      .then((note) => {
        attachmentManagement.cloneAttachments(firstNote, note)
        return note
      })
      .then((note) => {
        dispatch({
          type: 'UPDATE_NOTE',
          note: note
        })

        this.setState({
          selectedNoteKeys: [note.key]
        })

        hashHistory.push({
          pathname: location.pathname,
          query: {key: note.key}
        })
      })
  }

  copyNoteLink (note) {
    const noteLink = `[${note.title}](:note:${note.key})`
    return copy(noteLink)
  }

  navigate (sender, pathname) {
    const { router } = this.context
    router.push({
      pathname,
      query: {
        // key: noteKey
      }
    })
  }

  save (note) {
    const { dispatch } = this.props
    dataApi
      .updateNote(note.storage, note.key, note)
      .then((note) => {
        dispatch({
          type: 'UPDATE_NOTE',
          note: note
        })
      })
  }

  publishMarkdown () {
    if (this.pendingPublish) {
      clearTimeout(this.pendingPublish)
    }
    this.pendingPublish = setTimeout(() => {
      this.publishMarkdownNow()
    }, 1000)
  }

  publishMarkdownNow () {
    const {selectedNoteKeys} = this.state
    const notes = this.notes.map((note) => Object.assign({}, note))
    const selectedNotes = findNotesByKeys(notes, selectedNoteKeys)
    const firstNote = selectedNotes[0]
    const config = ConfigManager.get()
    const {address, token, authMethod, username, password} = config.blog
    let authToken = ''
    if (authMethod === 'USER') {
      authToken = `Basic ${window.btoa(`${username}:${password}`)}`
    } else {
      authToken = `Bearer ${token}`
    }
    const contentToRender = firstNote.content.replace(`# ${firstNote.title}`, '')
    const markdown = new Markdown()
    const data = {
      title: firstNote.title,
      content: markdown.render(contentToRender),
      status: 'publish'
    }

    let url = ''
    let method = ''
    if (firstNote.blog && firstNote.blog.blogId) {
      url = `${address}${WP_POST_PATH}/${firstNote.blog.blogId}`
      method = 'PUT'
    } else {
      url = `${address}${WP_POST_PATH}`
      method = 'POST'
    }
    // eslint-disable-next-line no-undef
    fetch(url, {
      method: method,
      body: JSON.stringify(data),
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
      .then(response => {
        if (_.isNil(response.link) || _.isNil(response.id)) {
          return Promise.reject()
        }
        firstNote.blog = {
          blogLink: response.link,
          blogId: response.id
        }
        this.save(firstNote)
        this.confirmPublish(firstNote)
      })
      .catch((error) => {
        console.error(error)
        this.confirmPublishError()
      })
  }

  confirmPublishError () {
    const { remote } = electron
    const { dialog } = remote
    const alertError = {
      type: 'warning',
      message: i18n.__('Publish Failed'),
      detail: i18n.__('Check and update your blog setting and try again.'),
      buttons: [i18n.__('Confirm')]
    }
    dialog.showMessageBox(remote.getCurrentWindow(), alertError)
  }

  confirmPublish (note) {
    const buttonIndex = dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'warning',
      message: i18n.__('Publish Succeeded'),
      detail: `${note.title} is published at ${note.blog.blogLink}`,
      buttons: [i18n.__('Confirm'), i18n.__('Open Blog')]
    })

    if (buttonIndex === 1) {
      this.openBlog(note)
    }
  }

  openBlog (note) {
    const { shell } = electron
    shell.openExternal(note.blog.blogLink)
  }

  importFromFile () {
    const options = {
      filters: [
        { name: 'Documents', extensions: ['md', 'txt'] }
      ],
      properties: ['openFile', 'multiSelections']
    }

    dialog.showOpenDialog(remote.getCurrentWindow(), options, (filepaths) => {
      this.addNotesFromFiles(filepaths)
    })
  }

  handleDrop (e) {
    e.preventDefault()
    const { location } = this.props
    const filepaths = Array.from(e.dataTransfer.files).map(file => { return file.path })
    if (!location.pathname.match(/\/trashed/)) this.addNotesFromFiles(filepaths)
  }

  // Add notes to the current folder
  addNotesFromFiles (filepaths) {
    const { dispatch, location } = this.props
    const { storage, folder } = this.resolveTargetFolder()

    if (filepaths === undefined) return
    filepaths.forEach((filepath) => {
      fs.readFile(filepath, (err, data) => {
        if (err) throw Error('File reading error: ', err)

        fs.stat(filepath, (err, {mtime, birthtime}) => {
          if (err) throw Error('File stat reading error: ', err)

          const content = data.toString()
          const newNote = {
            content: content,
            folder: folder.key,
            title: path.basename(filepath, path.extname(filepath)),
            type: 'MARKDOWN_NOTE',
            createdAt: birthtime,
            updatedAt: mtime
          }
          dataApi.createNote(storage.key, newNote)
          .then((note) => {
            dispatch({
              type: 'UPDATE_NOTE',
              note: note
            })
            hashHistory.push({
              pathname: location.pathname,
              query: {key: getNoteKey(note)}
            })
          })
        })
      })
    })
  }

  getTargetIndex () {
    const { location } = this.props
    const targetIndex = _.findIndex(this.notes, (note) => {
      return getNoteKey(note) === location.query.key
    })
    return targetIndex
  }

  resolveTargetFolder () {
    const { data, params } = this.props
    let storage = data.storageMap.get(params.storageKey)

    // Find first storage
    if (storage == null) {
      for (const kv of data.storageMap) {
        storage = kv[1]
        break
      }
    }

    if (storage == null) this.showMessageBox('No storage for importing note(s)')
    const folder = _.find(storage.folders, {key: params.folderKey}) || storage.folders[0]
    if (folder == null) this.showMessageBox('No folder for importing note(s)')

    return {
      storage,
      folder
    }
  }

  showMessageBox (message) {
    dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'warning',
      message: message,
      buttons: [i18n.__('OK')]
    })
  }

  getNoteStorage (note) { // note.storage = storage key
    return this.props.data.storageMap.toJS()[note.storage]
  }

  getNoteFolder (note) { // note.folder = folder key
    return _.find(this.getNoteStorage(note).folders, ({ key }) => key === note.folder)
  }

  getViewType () {
    const { pathname } = this.props.location
    const folder = /\/folders\/[a-zA-Z0-9]+/.test(pathname)
    const storage = /\/storages\/[a-zA-Z0-9]+/.test(pathname) && !folder
    const allNotes = pathname === '/home'
    if (allNotes) return 'ALL'
    if (folder) return 'FOLDER'
    if (storage) return 'STORAGE'
  }

  render () {
    const { location, config, params: { folderKey } } = this.props
    let { notes } = this.props
    const { selectedNoteKeys } = this.state
    const sortBy = _.get(config, [folderKey, 'sortBy'], config.sortBy.default)
    const sortFunc = sortBy === 'CREATED_AT'
      ? sortByCreatedAt
      : sortBy === 'ALPHABETICAL'
      ? sortByAlphabetical
      : sortByUpdatedAt
    const sortedNotes = location.pathname.match(/\/starred|\/trash/)
        ? this.getNotes().sort(sortFunc)
        : this.sortByPin(this.getNotes().sort(sortFunc))
    this.notes = notes = sortedNotes.filter((note) => {
      // this is for the trash box
      if (note.isTrashed !== true || location.pathname === '/trashed') return true
    })

    moment.updateLocale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: '%ds',
        ss: '%ss',
        m: '1m',
        mm: '%dm',
        h: 'an hour',
        hh: '%dh',
        d: '1d',
        dd: '%dd',
        M: '1M',
        MM: '%dM',
        y: '1Y',
        yy: '%dY'
      }
    })

    const viewType = this.getViewType()

    const autoSelectFirst =
      notes.length === 1 ||
      selectedNoteKeys.length === 0 ||
      notes.every(note => !selectedNoteKeys.includes(note.key))

    const noteList = notes
      .map((note, index) => {
        if (note == null) {
          return null
        }

        const isDefault = config.listStyle === 'DEFAULT'
        const uniqueKey = getNoteKey(note)

        const isActive =
          selectedNoteKeys.includes(uniqueKey) ||
          notes.length === 1 ||
          (autoSelectFirst && index === 0)
        const dateDisplay = moment(
          sortBy === 'CREATED_AT'
            ? note.createdAt : note.updatedAt
        ).fromNow('D')

        if (isDefault) {
          return (
            <NoteItem
              isActive={isActive}
              note={note}
              dateDisplay={dateDisplay}
              key={uniqueKey}
              handleNoteContextMenu={this.handleNoteContextMenu.bind(this)}
              handleNoteClick={this.handleNoteClick.bind(this)}
              handleDragStart={this.handleDragStart.bind(this)}
              pathname={location.pathname}
              folderName={this.getNoteFolder(note).name}
              storageName={this.getNoteStorage(note).name}
              viewType={viewType}
            />
          )
        }

        return (
          <NoteItemSimple
            isActive={isActive}
            note={note}
            key={uniqueKey}
            handleNoteContextMenu={this.handleNoteContextMenu.bind(this)}
            handleNoteClick={this.handleNoteClick.bind(this)}
            handleDragStart={this.handleDragStart.bind(this)}
            pathname={location.pathname}
            folderName={this.getNoteFolder(note).name}
            storageName={this.getNoteStorage(note).name}
            viewType={viewType}
          />
        )
      })

    return (
      <div className='NoteList'
        styleName='root'
        style={this.props.style}
        onDrop={(e) => this.handleDrop(e)}
      >
        <div styleName='control'>
          <div styleName='control-sortBy'>
            <i className='fa fa-angle-down' />
            <select styleName='control-sortBy-select'
              title={i18n.__('Select filter mode')}
              value={sortBy}
              onChange={(e) => this.handleSortByChange(e)}
            >
              <option title='Sort by update time' value='UPDATED_AT'>{i18n.__('Updated')}</option>
              <option title='Sort by create time' value='CREATED_AT'>{i18n.__('Created')}</option>
              <option title='Sort alphabetically' value='ALPHABETICAL'>{i18n.__('Alphabetically')}</option>
            </select>
          </div>
          <div styleName='control-button-area'>
            <button title={i18n.__('Default View')} styleName={config.listStyle === 'DEFAULT'
                ? 'control-button--active'
                : 'control-button'
              }
              onClick={(e) => this.handleListStyleButtonClick(e, 'DEFAULT')}
            >
              <img styleName='iconTag' src='../resources/icon/icon-column.svg' />
            </button>
            <button title={i18n.__('Compressed View')} styleName={config.listStyle === 'SMALL'
                ? 'control-button--active'
                : 'control-button'
              }
              onClick={(e) => this.handleListStyleButtonClick(e, 'SMALL')}
            >
              <img styleName='iconTag' src='../resources/icon/icon-column-list.svg' />
            </button>
          </div>
        </div>
        <div styleName='list'
          ref='list'
          tabIndex='-1'
          onKeyDown={(e) => this.handleNoteListKeyDown(e)}
          onKeyUp={this.handleNoteListKeyUp}
        >
          {noteList}
        </div>
      </div>
    )
  }
}
NoteList.contextTypes = {
  router: PropTypes.shape([])
}

NoteList.propTypes = {
  dispatch: PropTypes.func,
  repositories: PropTypes.array,
  style: PropTypes.shape({
    width: PropTypes.number
  })
}

export default debounceRender(CSSModules(NoteList, styles))
