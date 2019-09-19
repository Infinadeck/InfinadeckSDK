import test from 'ava'
import Markdown from 'browser/lib/markdown'
import markdownFixtures from '../fixtures/markdowns'

// basic markdown instance which meant to be used in every test cases.
// To test markdown options, initialize a new instance in your test case
const md = new Markdown()

test('Markdown.render() should renders markdown correctly', t => {
  const rendered = md.render(markdownFixtures.basic)
  t.snapshot(rendered)
})

test('Markdown.render() should renders codeblock correctly', t => {
  const rendered = md.render(markdownFixtures.codeblock)
  t.snapshot(rendered)
})

test('Markdown.render() should renders KaTeX correctly', t => {
  const rendered = md.render(markdownFixtures.katex)
  t.snapshot(rendered)
})

test('Markdown.render() should renders checkboxes', t => {
  const rendered = md.render(markdownFixtures.checkboxes)
  t.snapshot(rendered)
})

test('Markdown.render() should text with quotes correctly', t => {
  const renderedSmartQuotes = md.render(markdownFixtures.smartQuotes)
  t.snapshot(renderedSmartQuotes)

  const newmd = new Markdown({ typographer: false })
  const renderedNonSmartQuotes = newmd.render(markdownFixtures.smartQuotes)
  t.snapshot(renderedNonSmartQuotes)
})

test('Markdown.render() should render line breaks correctly', t => {
  const renderedBreaks = md.render(markdownFixtures.breaks)
  t.snapshot(renderedBreaks)

  const newmd = new Markdown({ breaks: false })
  const renderedNonBreaks = newmd.render(markdownFixtures.breaks)
  t.snapshot(renderedNonBreaks)
})
