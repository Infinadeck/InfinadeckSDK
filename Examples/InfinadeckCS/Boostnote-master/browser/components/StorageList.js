/**
* @fileoverview Micro component for showing StorageList
*/
import PropTypes from 'prop-types'
import React from 'react'
import styles from './StorageList.styl'
import CSSModules from 'browser/lib/CSSModules'

/**
* @param {Array} storgaeList
*/

const StorageList = ({storageList, isFolded}) => (
  <div styleName={isFolded ? 'storageList-folded' : 'storageList'}>
    {storageList.length > 0 ? storageList : (
      <div styleName='storgaeList-empty'>No storage mount.</div>
    )}
  </div>
)

StorageList.propTypes = {
  storgaeList: PropTypes.arrayOf(PropTypes.element).isRequired
}
export default CSSModules(StorageList, styles)
