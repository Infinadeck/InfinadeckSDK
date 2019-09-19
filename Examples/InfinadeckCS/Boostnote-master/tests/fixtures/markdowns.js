const basic = `
# Welcome to Boostnote!
## Click here to edit markdown :wave:

<iframe width="560" height="315" src="https://www.youtube.com/embed/L0qNPLsvmyM" frameborder="0" allowfullscreen></iframe>

## Docs :memo:
- [Boostnote | Boost your happiness, productivity and creativity.](https://hackernoon.com/boostnote-boost-your-happiness-productivity-and-creativity-315034efeebe)
- [Cloud Syncing & Backups](https://github.com/BoostIO/Boostnote/wiki/Cloud-Syncing-and-Backup)
- [How to sync your data across Desktop and Mobile apps](https://github.com/BoostIO/Boostnote/wiki/Sync-Data-Across-Desktop-and-Mobile-apps)
- [Convert data from **Evernote** to Boostnote.](https://github.com/BoostIO/Boostnote/wiki/Evernote)
- [Keyboard Shortcuts](https://github.com/BoostIO/Boostnote/wiki/Keyboard-Shortcuts)
- [Keymaps in Editor mode](https://github.com/BoostIO/Boostnote/wiki/Keymaps-in-Editor-mode)
- [How to set syntax highlight in Snippet note](https://github.com/BoostIO/Boostnote/wiki/Syntax-Highlighting)

---

## Article Archive :books:
- [Reddit English](http://bit.ly/2mOJPu7)
- [Reddit Spanish](https://www.reddit.com/r/boostnote_es/)
- [Reddit Chinese](https://www.reddit.com/r/boostnote_cn/)
- [Reddit Japanese](https://www.reddit.com/r/boostnote_jp/)

---

## Community :beers:
- [GitHub](http://bit.ly/2AWWzkD)
- [Twitter](http://bit.ly/2z8BUJZ)
- [Facebook Group](http://bit.ly/2jcca8t)
`

const codeblock = `
\`\`\`js:filename.js:2
var project = 'boostnote';
\`\`\`
`

const katex = `
$$
c = \pm\sqrt{a^2 + b^2}
$$
`

const checkboxes = `
- [ ] Unchecked
- [x] Checked
`

const smartQuotes = 'This is a "QUOTE".'

const breaks = 'This is the first line.\nThis is the second line.'

export default {
  basic,
  codeblock,
  katex,
  checkboxes,
  smartQuotes,
  breaks
}
