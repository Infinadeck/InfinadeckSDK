import React from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './Crowdfunding.styl'
import i18n from 'browser/lib/i18n'

const electron = require('electron')
const { shell } = electron

class Crowdfunding extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }
  }

  handleLinkClick (e) {
    shell.openExternal(e.currentTarget.href)
    e.preventDefault()
  }

  render () {
    return (
      <div styleName='root'>
        <div styleName='header'>{i18n.__('Crowdfunding')}</div>
        <p>{i18n.__('Dear everyone,')}</p>
        <br />
        <p>{i18n.__('Thank you for using Boostnote!')}</p>
        <p>{i18n.__('Boostnote is used in about 200 different countries and regions by an awesome community of developers.')}</p>
        <br />
        <p>{i18n.__('To continue supporting this growth, and to satisfy community expectations,')}</p>
        <p>{i18n.__('we would like to invest more time and resources in this project.')}</p>
        <br />
        <p>{i18n.__('If you like this project and see its potential, you can help by supporting us on OpenCollective!')}</p>
        <br />
        <p>{i18n.__('Thanks,')}</p>
        <p>{i18n.__('Boostnote maintainers')}</p>
        <br />
        <button styleName='cf-link'>
          <a href='https://opencollective.com/boostnoteio' onClick={(e) => this.handleLinkClick(e)}>{i18n.__('Support via OpenCollective')}</a>
        </button>
      </div>
    )
  }
}

Crowdfunding.propTypes = {
}

export default CSSModules(Crowdfunding, styles)
