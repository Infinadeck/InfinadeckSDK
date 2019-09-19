import PropTypes from 'prop-types'
import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './StorageItem.styl'
import { hashHistory } from 'react-router'
import modal from 'browser/main/lib/modal'
import CreateFolderModal from 'browser/main/modals/CreateFolderModal'
import RenameFolderModal from 'browser/main/modals/RenameFolderModal'
import dataApi from 'browser/main/lib/dataApi'
import StorageItemChild from 'browser/components/StorageItem'
import _ from 'lodash'
import { SortableElement } from 'react-sortable-hoc'
import i18n from 'browser/lib/i18n'
import context from 'browser/lib/context'

const { remote } = require('electron')
const { dialog } = remote
const escapeStringRegexp = require('escape-string-regexp')
const path = require('path')

class StorageItem extends React.Component {
  constructor (props) {
    super(props)

    const { storage } = this.props

    this.state = {
      isOpen: !!storage.isOpen
    }
  }

  handleHeaderContextMenu (e) {
    context.popup([
      {
        label: i18n.__('Add Folder'),
        click: (e) => this.handleAddFolderButtonClick(e)
      },
      {
        type: 'separator'
      },
      {
        label: i18n.__('Export Storage'),
        submenu: [
          {
            label: i18n.__('Export as txt'),
            click: (e) => this.handleExportStorageClick(e, 'txt')
          },
          {
            label: i18n.__('Export as md'),
            click: (e) => this.handleExportStorageClick(e, 'md')
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: i18n.__('Unlink Storage'),
        click: (e) => this.handleUnlinkStorageClick(e)
      }
    ])
  }

  handleUnlinkStorageClick (e) {
    const index = dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'warning',
      message: i18n.__('Unlink Storage'),
      detail: i18n.__('This work will just detatches a storage from Boostnote. (Any data won\'t be deleted.)'),
      buttons: [i18n.__('Confirm'), i18n.__('Cancel')]
    })

    if (index === 0) {
      const { storage, dispatch } = this.props
      dataApi.removeStorage(storage.key)
        .then(() => {
          dispatch({
            type: 'REMOVE_STORAGE',
            storageKey: storage.key
          })
        })
        .catch((err) => {
          throw err
        })
    }
  }

  handleExportStorageClick (e, fileType) {
    const options = {
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: i18n.__('Select directory'),
      title: i18n.__('Select a folder to export the files to'),
      multiSelections: false
    }
    dialog.showOpenDialog(remote.getCurrentWindow(), options,
      (paths) => {
        if (paths && paths.length === 1) {
          const { storage, dispatch } = this.props
          dataApi
            .exportStorage(storage.key, fileType, paths[0])
            .then(data => {
              dispatch({
                type: 'EXPORT_STORAGE',
                storage: data.storage,
                fileType: data.fileType
              })
            })
        }
      })
  }

  handleToggleButtonClick (e) {
    const { storage, dispatch } = this.props
    const isOpen = !this.state.isOpen
    dataApi.toggleStorage(storage.key, isOpen)
      .then((storage) => {
        dispatch({
          type: 'EXPAND_STORAGE',
          storage,
          isOpen
        })
      })
    this.setState({
      isOpen: isOpen
    })
  }

  handleAddFolderButtonClick (e) {
    const { storage } = this.props

    modal.open(CreateFolderModal, {
      storage
    })
  }

  handleHeaderInfoClick (e) {
    const { storage } = this.props
    hashHistory.push('/storages/' + storage.key)
  }

  handleFolderButtonClick (folderKey) {
    return (e) => {
      const { storage } = this.props
      hashHistory.push('/storages/' + storage.key + '/folders/' + folderKey)
    }
  }

  handleFolderButtonContextMenu (e, folder) {
    context.popup([
      {
        label: i18n.__('Rename Folder'),
        click: (e) => this.handleRenameFolderClick(e, folder)
      },
      {
        type: 'separator'
      },
      {
        label: i18n.__('Export Folder'),
        submenu: [
          {
            label: i18n.__('Export as txt'),
            click: (e) => this.handleExportFolderClick(e, folder, 'txt')
          },
          {
            label: i18n.__('Export as md'),
            click: (e) => this.handleExportFolderClick(e, folder, 'md')
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: i18n.__('Delete Folder'),
        click: (e) => this.handleFolderDeleteClick(e, folder)
      }
    ])
  }

  handleRenameFolderClick (e, folder) {
    const { storage } = this.props
    modal.open(RenameFolderModal, {
      storage,
      folder
    })
  }

  handleExportFolderClick (e, folder, fileType) {
    const options = {
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: i18n.__('Select directory'),
      title: i18n.__('Select a folder to export the files to'),
      multiSelections: false
    }
    dialog.showOpenDialog(remote.getCurrentWindow(), options,
    (paths) => {
      if (paths && paths.length === 1) {
        const { storage, dispatch } = this.props
        dataApi
          .exportFolder(storage.key, folder.key, fileType, paths[0])
          .then((data) => {
            dispatch({
              type: 'EXPORT_FOLDER',
              storage: data.storage,
              folderKey: data.folderKey,
              fileType: data.fileType
            })
          })
      }
    })
  }

  handleFolderDeleteClick (e, folder) {
    const index = dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'warning',
      message: i18n.__('Delete Folder'),
      detail: i18n.__('This will delete all notes in the folder and can not be undone.'),
      buttons: [i18n.__('Confirm'), i18n.__('Cancel')]
    })

    if (index === 0) {
      const { storage, dispatch } = this.props
      dataApi
        .deleteFolder(storage.key, folder.key)
        .then((data) => {
          dispatch({
            type: 'DELETE_FOLDER',
            storage: data.storage,
            folderKey: data.folderKey
          })
        })
    }
  }

  handleDragEnter (e) {
    e.dataTransfer.setData('defaultColor', e.target.style.backgroundColor)
    e.target.style.backgroundColor = 'rgba(129, 130, 131, 0.08)'
  }

  handleDragLeave (e) {
    e.target.style.opacity = '1'
    e.target.style.backgroundColor = e.dataTransfer.getData('defaultColor')
  }

  dropNote (storage, folder, dispatch, location, noteData) {
    noteData = noteData.filter((note) => folder.key !== note.folder)
    if (noteData.length === 0) return

    Promise.all(
      noteData.map((note) => dataApi.moveNote(note.storage, note.key, storage.key, folder.key))
    )
    .then((createdNoteData) => {
      createdNoteData.forEach((newNote) => {
        dispatch({
          type: 'MOVE_NOTE',
          originNote: noteData.find((note) => note.content === newNote.oldContent),
          note: newNote
        })
      })
    })
    .catch((err) => {
      console.error(`error on delete notes: ${err}`)
    })
  }

  handleDrop (e, storage, folder, dispatch, location) {
    e.target.style.opacity = '1'
    e.target.style.backgroundColor = e.dataTransfer.getData('defaultColor')
    const noteData = JSON.parse(e.dataTransfer.getData('note'))
    this.dropNote(storage, folder, dispatch, location, noteData)
  }

  render () {
    const { storage, location, isFolded, data, dispatch } = this.props
    const { folderNoteMap, trashedSet } = data
    const SortableStorageItemChild = SortableElement(StorageItemChild)
    const folderList = storage.folders.map((folder, index) => {
      let folderRegex = new RegExp(escapeStringRegexp(path.sep) + 'storages' + escapeStringRegexp(path.sep) + storage.key + escapeStringRegexp(path.sep) + 'folders' + escapeStringRegexp(path.sep) + folder.key)
      const isActive = !!(location.pathname.match(folderRegex))
      const noteSet = folderNoteMap.get(storage.key + '-' + folder.key)

      let noteCount = 0
      if (noteSet) {
        let trashedNoteCount = 0
        const noteKeys = noteSet.map(noteKey => { return noteKey })
        trashedSet.toJS().forEach(trashedKey => {
          if (noteKeys.some(noteKey => { return noteKey === trashedKey })) trashedNoteCount++
        })
        noteCount = noteSet.size - trashedNoteCount
      }
      return (
        <SortableStorageItemChild
          key={folder.key}
          index={index}
          isActive={isActive}
          handleButtonClick={(e) => this.handleFolderButtonClick(folder.key)(e)}
          handleContextMenu={(e) => this.handleFolderButtonContextMenu(e, folder)}
          folderName={folder.name}
          folderColor={folder.color}
          isFolded={isFolded}
          noteCount={noteCount}
          handleDrop={(e) => this.handleDrop(e, storage, folder, dispatch, location)}
          handleDragEnter={this.handleDragEnter}
          handleDragLeave={this.handleDragLeave}
        />
      )
    })

    const isActive = location.pathname.match(new RegExp(escapeStringRegexp(path.sep) + 'storages' + escapeStringRegexp(path.sep) + storage.key + '$'))

    return (
      <div styleName={isFolded ? 'root--folded' : 'root'}
        key={storage.key}
      >
        <div styleName={isActive
          ? 'header--active'
          : 'header'
        }
          onContextMenu={(e) => this.handleHeaderContextMenu(e)}
        >
          <button styleName='header-toggleButton'
            onMouseDown={(e) => this.handleToggleButtonClick(e)}
          >
            <img src={this.state.isOpen
              ? '../resources/icon/icon-down.svg'
              : '../resources/icon/icon-right.svg'
            }
            />
          </button>

          {!isFolded &&
            <button styleName='header-addFolderButton'
              onClick={(e) => this.handleAddFolderButtonClick(e)}
            >
              <img styleName='iconTag' src='../resources/icon/icon-plus.svg' />
            </button>
          }

          <button styleName='header-info'
            onClick={(e) => this.handleHeaderInfoClick(e)}
          >
            <span styleName='header-info-name'>
              {isFolded ? _.truncate(storage.name, {length: 1, omission: ''}) : storage.name}
            </span>
            {isFolded &&
              <span styleName='header-info--folded-tooltip'>
                {storage.name}
              </span>
            }
          </button>
        </div>
        {this.state.isOpen &&
          <div styleName='folderList' >
            {folderList}
          </div>
        }
      </div>
    )
  }
}

StorageItem.propTypes = {
  isFolded: PropTypes.bool
}

export default CSSModules(StorageItem, styles)
