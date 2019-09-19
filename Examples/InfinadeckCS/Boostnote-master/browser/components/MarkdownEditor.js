import PropTypes from 'prop-types'
import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './MarkdownEditor.styl'
import CodeEditor from 'browser/components/CodeEditor'
import MarkdownPreview from 'browser/components/MarkdownPreview'
import eventEmitter from 'browser/main/lib/eventEmitter'
import { findStorage } from 'browser/lib/findStorage'

class MarkdownEditor extends React.Component {
  constructor (props) {
    super(props)

    // char codes for ctrl + w
    this.escapeFromEditor = [17, 87]

    // ctrl + shift + ;
    this.supportMdSelectionBold = [16, 17, 186]

    this.state = {
      status: 'PREVIEW',
      renderValue: props.value,
      keyPressed: new Set(),
      isLocked: false
    }

    this.lockEditorCode = () => this.handleLockEditor()
  }

  componentDidMount () {
    this.value = this.refs.code.value
    eventEmitter.on('editor:lock', this.lockEditorCode)
  }

  componentDidUpdate () {
    this.value = this.refs.code.value
  }

  componentWillReceiveProps (props) {
    if (props.value !== this.props.value) {
      this.queueRendering(props.value)
    }
  }

  componentWillUnmount () {
    this.cancelQueue()
    eventEmitter.off('editor:lock', this.lockEditorCode)
  }

  queueRendering (value) {
    clearTimeout(this.renderTimer)
    this.renderTimer = setTimeout(() => {
      this.renderPreview(value)
    }, 500)
  }

  cancelQueue () {
    clearTimeout(this.renderTimer)
  }

  renderPreview (value) {
    this.setState({
      renderValue: value
    })
  }

  handleChange (e) {
    this.value = this.refs.code.value
    this.props.onChange(e)
  }

  handleContextMenu (e) {
    const { config } = this.props
    if (config.editor.switchPreview === 'RIGHTCLICK') {
      const newStatus = this.state.status === 'PREVIEW'
        ? 'CODE'
        : 'PREVIEW'
      this.setState({
        status: newStatus
      }, () => {
        if (newStatus === 'CODE') {
          this.refs.code.focus()
        } else {
          this.refs.preview.focus()
        }
        eventEmitter.emit('topbar:togglelockbutton', this.state.status)
      })
    }
  }

  handleBlur (e) {
    if (this.state.isLocked) return
    this.setState({ keyPressed: new Set() })
    const { config } = this.props
    if (config.editor.switchPreview === 'BLUR' ||
        (config.editor.switchPreview === 'DBL_CLICK' && this.state.status === 'CODE')
    ) {
      const cursorPosition = this.refs.code.editor.getCursor()
      this.setState({
        status: 'PREVIEW'
      }, () => {
        this.refs.preview.focus()
        this.refs.preview.scrollTo(cursorPosition.line)
      })
      eventEmitter.emit('topbar:togglelockbutton', this.state.status)
    }
  }

  handleDoubleClick (e) {
    if (this.state.isLocked) return
    this.setState({keyPressed: new Set()})
    const { config } = this.props
    if (config.editor.switchPreview === 'DBL_CLICK') {
      this.setState({
        status: 'CODE'
      }, () => {
        this.refs.code.focus()
        eventEmitter.emit('topbar:togglelockbutton', this.state.status)
      })
    }
  }

  handlePreviewMouseDown (e) {
    this.previewMouseDownedAt = new Date()
  }

  handlePreviewMouseUp (e) {
    const { config } = this.props
    if (config.editor.switchPreview === 'BLUR' && new Date() - this.previewMouseDownedAt < 200) {
      this.setState({
        status: 'CODE'
      }, () => {
        this.refs.code.focus()
      })
      eventEmitter.emit('topbar:togglelockbutton', this.state.status)
    }
  }

  handleCheckboxClick (e) {
    e.preventDefault()
    e.stopPropagation()
    const idMatch = /checkbox-([0-9]+)/
    const checkedMatch = /\[x\]/i
    const uncheckedMatch = /\[ \]/
    if (idMatch.test(e.target.getAttribute('id'))) {
      const lineIndex = parseInt(e.target.getAttribute('id').match(idMatch)[1], 10) - 1
      const lines = this.refs.code.value
        .split('\n')

      const targetLine = lines[lineIndex]

      if (targetLine.match(checkedMatch)) {
        lines[lineIndex] = targetLine.replace(checkedMatch, '[ ]')
      }
      if (targetLine.match(uncheckedMatch)) {
        lines[lineIndex] = targetLine.replace(uncheckedMatch, '[x]')
      }
      this.refs.code.setValue(lines.join('\n'))
    }
  }

  focus () {
    if (this.state.status === 'PREVIEW') {
      this.setState({
        status: 'CODE'
      }, () => {
        this.refs.code.focus()
      })
    } else {
      this.refs.code.focus()
    }
    eventEmitter.emit('topbar:togglelockbutton', this.state.status)
  }

  reload () {
    this.refs.code.reload()
    this.cancelQueue()
    this.renderPreview(this.props.value)
  }

  handleKeyDown (e) {
    const { config } = this.props
    if (this.state.status !== 'CODE') return false
    const keyPressed = this.state.keyPressed
    keyPressed.add(e.keyCode)
    this.setState({ keyPressed })
    const isNoteHandlerKey = (el) => { return keyPressed.has(el) }
    // These conditions are for ctrl-e and ctrl-w
    if (keyPressed.size === this.escapeFromEditor.length &&
        !this.state.isLocked && this.state.status === 'CODE' &&
        this.escapeFromEditor.every(isNoteHandlerKey)) {
      this.handleContextMenu()
      if (config.editor.switchPreview === 'BLUR') document.activeElement.blur()
    }
    if (keyPressed.size === this.supportMdSelectionBold.length && this.supportMdSelectionBold.every(isNoteHandlerKey)) {
      this.addMdAroundWord('**')
    }
  }

  addMdAroundWord (mdElement) {
    if (this.refs.code.editor.getSelection()) {
      return this.addMdAroundSelection(mdElement)
    }
    const currentCaret = this.refs.code.editor.getCursor()
    const word = this.refs.code.editor.findWordAt(currentCaret)
    const cmDoc = this.refs.code.editor.getDoc()
    cmDoc.replaceRange(mdElement, word.anchor)
    cmDoc.replaceRange(mdElement, { line: word.head.line, ch: word.head.ch + mdElement.length })
  }

  addMdAroundSelection (mdElement) {
    this.refs.code.editor.replaceSelection(`${mdElement}${this.refs.code.editor.getSelection()}${mdElement}`)
  }

  handleKeyUp (e) {
    const keyPressed = this.state.keyPressed
    keyPressed.delete(e.keyCode)
    this.setState({ keyPressed })
  }

  handleLockEditor () {
    this.setState({ isLocked: !this.state.isLocked })
  }

  render () {
    const {className, value, config, storageKey, noteKey} = this.props

    let editorFontSize = parseInt(config.editor.fontSize, 10)
    if (!(editorFontSize > 0 && editorFontSize < 101)) editorFontSize = 14
    let editorIndentSize = parseInt(config.editor.indentSize, 10)
    if (!(editorFontSize > 0 && editorFontSize < 132)) editorIndentSize = 4

    const previewStyle = {}
    if (this.props.ignorePreviewPointerEvents) previewStyle.pointerEvents = 'none'

    const storage = findStorage(storageKey)

    return (
      <div className={className == null
          ? 'MarkdownEditor'
          : `MarkdownEditor ${className}`
        }
        onContextMenu={(e) => this.handleContextMenu(e)}
        tabIndex='-1'
        onKeyDown={(e) => this.handleKeyDown(e)}
        onKeyUp={(e) => this.handleKeyUp(e)}
      >
        <CodeEditor styleName={this.state.status === 'CODE'
            ? 'codeEditor'
            : 'codeEditor--hide'
          }
          ref='code'
          mode='GitHub Flavored Markdown'
          value={value}
          theme={config.editor.theme}
          keyMap={config.editor.keyMap}
          fontFamily={config.editor.fontFamily}
          fontSize={editorFontSize}
          indentType={config.editor.indentType}
          indentSize={editorIndentSize}
          enableRulers={config.editor.enableRulers}
          rulers={config.editor.rulers}
          displayLineNumbers={config.editor.displayLineNumbers}
          scrollPastEnd={config.editor.scrollPastEnd}
          storageKey={storageKey}
          noteKey={noteKey}
          fetchUrlTitle={config.editor.fetchUrlTitle}
          enableTableEditor={config.editor.enableTableEditor}
          onChange={(e) => this.handleChange(e)}
          onBlur={(e) => this.handleBlur(e)}
        />
        <MarkdownPreview styleName={this.state.status === 'PREVIEW'
            ? 'preview'
            : 'preview--hide'
          }
          style={previewStyle}
          theme={config.ui.theme}
          keyMap={config.editor.keyMap}
          fontSize={config.preview.fontSize}
          fontFamily={config.preview.fontFamily}
          codeBlockTheme={config.preview.codeBlockTheme}
          codeBlockFontFamily={config.editor.fontFamily}
          lineNumber={config.preview.lineNumber}
          indentSize={editorIndentSize}
          scrollPastEnd={config.preview.scrollPastEnd}
          smartQuotes={config.preview.smartQuotes}
          smartArrows={config.preview.smartArrows}
          breaks={config.preview.breaks}
          sanitize={config.preview.sanitize}
          ref='preview'
          onContextMenu={(e) => this.handleContextMenu(e)}
          onDoubleClick={(e) => this.handleDoubleClick(e)}
          tabIndex='0'
          value={this.state.renderValue}
          onMouseUp={(e) => this.handlePreviewMouseUp(e)}
          onMouseDown={(e) => this.handlePreviewMouseDown(e)}
          onCheckboxClick={(e) => this.handleCheckboxClick(e)}
          showCopyNotification={config.ui.showCopyNotification}
          storagePath={storage.path}
          noteKey={noteKey}
          customCSS={config.preview.customCSS}
          allowCustomCSS={config.preview.allowCustomCSS}
        />
      </div>
    )
  }
}

MarkdownEditor.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  ignorePreviewPointerEvents: PropTypes.bool
}

export default CSSModules(MarkdownEditor, styles)
