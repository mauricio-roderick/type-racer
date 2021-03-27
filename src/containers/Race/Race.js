import React, { PureComponent } from 'react'
import { Input, Button } from 'antd'
import { withRouter } from 'react-router-dom'
import _flow from 'lodash.flow'
import classnames from 'classnames'

import classes from './Race.scss'
import { connect as connectToApp } from '@providers/app'
import { LOADING, IDLE } from '@config/constant'
import Layout from '@containers/Layout/Layout'

const stringValue = "I never came to the beach or stood by the ocean, I never sat by the shore under the sun with my feet in the sand, but you brought me here and I'm happy that you did."
// const stringValue = 'Never ever quit.'

class Race extends PureComponent {
  state = {
    longText: '',
    userInput: '',
    wordsCompleted: [],
    matchedChars: [],
    countDownTimer: 0,
    gameInitStatus: IDLE,
    fetchTextStatus: LOADING
  }

  componentDidMount () {
  }

  async getuserInput () {
    return stringValue
  }

  initRace = async () => {
    this.setState({ gameInitStatus: LOADING })

    const stateUpdate = {
      gameInitStatus: IDLE
    }
    try {
      let longText = await this.getuserInput()
      longText = longText.trim()
      const words = longText.split(' ')

      stateUpdate.longText = longText
      stateUpdate.words = words.map((word, i) => i !== (words.length - 1) ? word + ' ' : word)
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
    this.setState(state => ({
      raceStarted: true,
      wordToMatch: state.words[0]
    }))
  }

  userInputOnChange = (e) => {
    const { value } = e.target
    this.setState(state => {
      const { wordToMatch, words } = state
      const matchedChars = []

      let stateUpdate = {
        userInput: value
      }

      if (value === wordToMatch) {
        const wordsCompleted = [...this.state.wordsCompleted, wordToMatch]
        stateUpdate = {
          userInput: '',
          matchedChars: [],
          wordsCompleted: wordsCompleted,
          wordToMatch: words[wordsCompleted.length]
        }

        if (wordsCompleted.length === words.length) {
          this.endRace()
        }
      } else {
        const _wordToMatch = wordToMatch.split('')
        value.split('').every((item, i) => {
          const matched = item === _wordToMatch[i]
          if (matched) matchedChars.push(item)
          return matched
        })

        if (matchedChars.length > this.state.matchedChars.length) {
          stateUpdate.matchedChars = matchedChars
        }
      }

      return stateUpdate
    })
  }

  endRace () {
  }

  currentWord () {
    const { wordToMatch, userInput, words, wordsCompleted } = this.state
    let currentWord = wordToMatch
    let fontColor = 'ant-typography-success'

    if (userInput) {
      const _wordToMatch = wordToMatch.split('')
      let matchCount = 0
      userInput.split('').every((item, i) => {
        const matched = item === _wordToMatch[i]
        if (matched) {
          matchCount++
        } else {
          fontColor = 'ant-typography-danger'
        }
        return matched
      })

      currentWord = currentWord.trim().split('')
      const matchedPortion = currentWord.splice(0, matchCount)
      const unmatchedPortion = currentWord.splice(0, userInput.length - matchedPortion.length)
      const wordSpace = (wordsCompleted.length < (words.length - 1)) ? ' ' : ''

      currentWord = (
        <>
          <span className={classes.currentWord}>
            <b>{matchedPortion}</b>
            <span className={classes.unmatched}>{unmatchedPortion}</span>
            {currentWord}
          </span>
          {wordSpace}
        </>
      )
    }

    const remaining = [...words].splice(wordsCompleted.length + 1)
    return (
      <>
        {wordsCompleted}
        {<span className={classnames('ant-typography', fontColor)}>{currentWord}</span>}
        {remaining}
      </>
    )
  }

  render () {
    const { wordToMatch = '', countDownTimer, raceStarted, userInput } = this.state

    const raceBox = raceStarted ? (
      <div className={classes.raceBox}>
        <div className={classes.longText}>{this.currentWord()}</div>
        <Input
          value={userInput}
          onChange={this.userInputOnChange}
          maxLength={wordToMatch.length + 5}
          size="large"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    ) : null

    return (
      <Layout>
        <div className="text-center">
          <Button
            onClick={this.initRace}
            className={classes.startBtn}
            size="large"
            type="primary"
          >Start Race</Button>
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