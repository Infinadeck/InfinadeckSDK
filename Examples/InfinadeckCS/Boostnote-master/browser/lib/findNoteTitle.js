export function findNoteTitle (value) {
  const splitted = value.split('\n')
  let title = null
  let isInsideCodeBlock = false

  if (splitted[0] === '---') {
    let line = 0
    while (++line < splitted.length) {
      if (splitted[line] === '---') {
        splitted.splice(0, line + 1)

        break
      }
    }
  }

  splitted.some((line, index) => {
    const trimmedLine = line.trim()
    const trimmedNextLine = splitted[index + 1] === undefined ? '' : splitted[index + 1].trim()
    if (trimmedLine.match('```')) {
      isInsideCodeBlock = !isInsideCodeBlock
    }
    if (isInsideCodeBlock === false && (trimmedLine.match(/^# +/) || trimmedNextLine.match(/^=+$/))) {
      title = trimmedLine
      return true
    }
  })

  if (title === null) {
    title = ''
    splitted.some((line) => {
      if (line.trim().length > 0) {
        title = line.trim()
        return true
      }
    })
  }

  return title
}

export default {
  findNoteTitle
}
