/**
 * @fileoverview Unit test for browser/lib/markdown
 */
const test = require('ava')
const markdown = require('browser/lib/markdownTextHelper')

test(t => {
  // [input, expected]
  const testCases = [
    // List
    [' - ', ' '],
    [' + ', ' '],
    [' * ', ' '],
    [' *   ', ' '],
    [' 1. ', ' '],
    [' 2.  ', ' '],
    [' 10. ', ' '],
    ['\t- ', '\t'],
    ['- ', ''],
    // Header with using line
    ['\n==', '\n'],
    ['\n===', '\n'],
    ['test\n===', 'test\n'],
    // Code block
    ['```test\n', ''],
    ['```test\nhoge', 'hoge'],
    // HTML tag
    ['<>', ''],
    ['<test>', 'test'],
    ['hoge<test>', 'hogetest'],
    ['<test>moge', 'testmoge'],
    // Emphasis
    ['~~', ''],
    ['~~text~~', 'text'],
    // Don't remove underscore
    ['`MY_TITLE`', 'MY_TITLE'],
    ['MY_TITLE', 'MY_TITLE'],
    // I have no idea for it...
    ['```test', '`test']
  ]

  testCases.forEach(testCase => {
    const [input, expected] = testCase
    t.is(markdown.strip(input), expected, `Test for strip() input: ${input} expected: ${expected}`)
  })
})
