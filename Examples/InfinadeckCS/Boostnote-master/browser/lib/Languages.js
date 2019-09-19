const languages = [
  {
    name: 'Albanian',
    locale: 'sq'
  },
  {
    name: 'Chinese (zh-CN)',
    locale: 'zh-CN'
  },
  {
    name: 'Chinese (zh-TW)',
    locale: 'zh-TW'
  },
  {
    name: 'Danish',
    locale: 'da'
  },
  {
    name: 'English',
    locale: 'en'
  },
  {
    name: 'French',
    locale: 'fr'
  },
  {
    name: 'German',
    locale: 'de'
  },
  {
    name: 'Hungarian',
    locale: 'hu'
  },
  {
    name: 'Japanese',
    locale: 'ja'
  },
  {
    name: 'Korean',
    locale: 'ko'
  },
  {
    name: 'Norwegian',
    locale: 'no'
  },
  {
    name: 'Polish',
    locale: 'pl'
  },
  {
    name: 'Portuguese',
    locale: 'pt'
  },
  {
    name: 'Russian',
    locale: 'ru'
  },
  {
    name: 'Spanish',
    locale: 'es-ES'
  }, {
    name: 'Turkish',
    locale: 'tr'
  }
]

module.exports = {
  getLocales () {
    return languages.reduce(function (localeList, locale) {
      localeList.push(locale.locale)
      return localeList
    }, [])
  },
  getLanguages () {
    return languages
  }
}

