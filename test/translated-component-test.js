import React from 'react'
import {describe, it} from 'mocha'
import assert from 'assert'
import {mount} from 'enzyme'
import includes from 'lodash/includes'
import translated, {TranslationProvider} from '../src'

const Dummy = ({
  title = 'title that should not be seen',
  label = 'label that should not be seen',
  message = 'message that should not be seen',
  id = 'dummyID'
}) => (
  <div id={id}><h1>{title}</h1><h2>{label}</h2><p>{message}</p></div>
)

const translations = {
  en_US: {
    title: 'Welcome {name}',
    label: 'You have {benjamins, number, money} benjamins!',
    message: 'They derk er jerbs!'
  },
  en_AU: {
    title: 'Rippa!',
    label: 'G\'day mate!',
    message: 'How the bloody hell are ya?'
  },
  en_IE: {
    label: 'Fiddle-de-dee putayteh.',
    message: 'Oi\'ve got {numPotatoes, plural, =0 {no putaytehs} =1 {one putayteh} other {# putaytehs}}'
  },
  en_CA: {
    title: 'Look at me, {word}'
  }
}

const params = {
  word: ({word}) => `I HAVE THE BEST WORDS, like: ${word}`
}

describe('Translate', () => {
  const DummyTranslated = translated({translations, params})(Dummy)
  const subject = ({language, ...rest}) => (
    mount(
      <TranslationProvider language={language} defaultLanguage='en_AU'>
        <DummyTranslated {...rest} />
      </TranslationProvider>
    )
  )

  it('passes non-translation props through unaltered', () => {
    assert(subject({id: 'testID'}).find('#testID').length === 1)
  })

  it('passes default (en-AU) translated strings to wrapped components', () => {
    const text = subject({}).text()
    assert(includes(text, translations['en_AU'].title))
    assert(includes(text, translations['en_AU'].label))
    assert(includes(text, translations['en_AU'].message))
  })

  it('passes translated strings alongside default fallbacks to wrapped components', () => {
    const text = subject({language: 'en_IE', numPotatoes: 0}).text()
    assert(includes(text, translations['en_AU'].title))
    assert(includes(text, translations['en_IE'].label))
  })

  it('formats money correctly for the language', () => {
    const text = subject({language: 'en_US', name: 'TestName', benjamins: 8.87654}).text()
    assert(includes(text, 'Welcome TestName'))
    assert(includes(text, 'You have $8.88 benjamins!'))
  })

  it('handles pluralisation', () => {
    const text = subject({language: 'en_IE', numPotatoes: 1}).text()
    assert(includes(text, 'Oi\'ve got one putayteh'))
  })

  it('transforms template params with supplied functions', () => {
    const text = subject({language: 'en_CA', word: 'bigly'}).text()
    assert(includes(text, 'Look at me, I HAVE THE BEST WORDS, like: bigly'))
  })
})
