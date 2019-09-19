import PropTypes from 'prop-types'
import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './ToggleModeButton.styl'
import i18n from 'browser/lib/i18n'

const ToggleModeButton = ({
  onClick, editorType
}) => (
  <div styleName='control-toggleModeButton'>
    <div styleName={editorType === 'SPLIT' ? 'active' : 'non-active'} onClick={() => onClick('SPLIT')}>
      <img styleName='item-star' src={editorType === 'EDITOR_PREVIEW' ? '../resources/icon/icon-mode-markdown-off-active.svg' : ''} />
    </div>
    <div styleName={editorType === 'EDITOR_PREVIEW' ? 'active' : 'non-active'} onClick={() => onClick('EDITOR_PREVIEW')}>
      <img styleName='item-star' src={editorType === 'EDITOR_PREVIEW' ? '' : '../resources/icon/icon-mode-split-on-active.svg'} />
    </div>
    <span styleName='tooltip'>{i18n.__('Toggle Mode')}</span>
  </div>
)

ToggleModeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  editorType: PropTypes.string.Required
}

export default CSSModules(ToggleModeButton, styles)
