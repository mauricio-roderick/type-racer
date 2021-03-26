import React, { PureComponent } from 'react'
import { Input, Button } from 'antd'
import { withRouter } from 'react-router-dom'
import _flow from 'lodash.flow'

import classes from './Race.scss'
import { connect as connectToApp } from '@providers/app'
import { LOADING, IDLE } from '@config/constant'
import Layout from '@containers/Layout/Layout'

// const textValue = "I never came to the beach or stood by the ocean, I never sat by the shore under the sun with my feet in the sand, but you brought me here and I'm happy that you did."
const stringValue = 'Never ever quit.'

class Race extends PureComponent {
  state = {
    text: '',
    textValue: '',
    wordsCompleted: [],
    countDownTimer: 0,
    gameInitStatus: IDLE,
    fetchTextStatus: LOADING
  }

  componentDidMount () {
  }

  async getTextValue () {
    return stringValue
  }

  initRace = async () => {
    this.setState({ gameInitStatus: LOADING })

    const stateUpdate = {
      gameInitStatus: IDLE
    }
    try {
      let text = await this.getTextValue()
      text = text.trim()

      stateUpdate.text = text
      stateUpdate.textArray = text.split(' ')
      this.countDown()
    } catch (e) {}

    this.setState(stateUpdate)
  }

  countDown = () => {
    this.setState(state => {
      const countDownTimer = !state.countDownTimer ? 1 : state.countDownTimer - 1
      return { countDownTimer }
    }, () => {
      const { countDownTimer } = this.state

      if (countDownTimer) {
        setTimeout(this.countDown, 200)
      } else {
        this.startRace()
      }
    })
  }

  startRace () {
    this.setState({
      raceStarted: true,
      wordToMatch: this.getWordToMatch()
    })
  }

  getWordToMatch (wordIndex = 0) {
    const { textArray } = this.state
    let wordToMatch = textArray[wordIndex]

    if (textArray.length > 1 && wordIndex !== (textArray.length - 1)) {
      wordToMatch += ' '
    }

    return wordToMatch
  }

  textValueOnChange = (e) => {
    const { value } = e.target
    this.setState(state => {
      const { wordToMatch } = state

      let stateUpdate = { textValue: value }

      if (value === wordToMatch) {
        const wordsCompleted = [...this.state.wordsCompleted, wordToMatch.trim()]
        stateUpdate = {
          textValue: '',
          wordsCompleted: wordsCompleted,
          wordToMatch: this.getWordToMatch(wordsCompleted.length)
        }
      }

      return stateUpdate
    })
  }

  currentWord () {
    const { wordToMatch, textValue, textArray, wordsCompleted } = this.state
    const _textValue = textValue.split('')
    const _wordToMatch = wordToMatch.trim().split('')
    let currentWord = wordToMatch.trim()

    if (textValue) {
      let matchedChars = 0
      _textValue.every((item, i) => {
        const matched = item === _wordToMatch[i]
        if (matched) matchedChars++
        return matched
      })

      const matchedPortion = _wordToMatch.splice(0, matchedChars)
      const unmatchedPortion = _wordToMatch.splice(0, _textValue.length - matchedPortion.length)

      currentWord = (
        <>
          <b>{matchedPortion}</b>
          <span>{unmatchedPortion}</span>
          {_wordToMatch}
        </>
      )
    }

    const remaining = [...textArray].splice(wordsCompleted.length + 1)
    return (
      <>
        {wordsCompleted.join(' ')}
        <span className={classes.currentWord}>{currentWord}</span>
        {remaining.join(' ')}
      </>
    )
  }

  render () {
    const { wordToMatch, text, countDownTimer, raceStarted, textValue } = this.state

    const raceBox = raceStarted ? (
      <div className={classes.raceBox}>
        <div className={classes.text}>
          {text}
        </div>
        <div>{this.currentWord()}</div>
        <i>{wordToMatch}</i>
        <Input
          value={textValue}
          onChange={this.textValueOnChange}
          autoCorrect="off"
          maxLength={wordToMatch.length + 5}
          autoCapitalize="off"
        />
      </div>
    ) : null

    return (
      <Layout>
        <div className="text-center">
          <Button onClick={this.initRace}>Start Race</Button>
          {!!countDownTimer && <div>{countDownTimer}</div>}
          {raceBox}
        </div>
      </Layout>
    )
  }
}

const appState = ({ isAuthenticated }) => {
  return { isAuthenticated }
}
export default _flow([
  withRouter,
  connectToApp(appState)
])(Race)