import React, { PureComponent } from 'react'
import { Row, Col, Input, Button, Alert } from 'antd'
import { ClockCircleOutlined, DashboardOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import _flow from 'lodash.flow'
import classnames from 'classnames'

import classes from './Race.scss'
import { connect as connectToApp } from '@providers/app'
import { LOADING, IDLE, raceStatus as raceStatusConf } from '@config/constant'
import { raceTimeLimit, raceCountdown } from '@config/collection'
import Layout from '@containers/Layout/Layout'

const stringValue = "I never came to the beach or stood by the ocean, I never sat by the shore under the sun with my feet in the sand, but you brought me here and I'm happy that you did."
// const stringValue = 'Never ever quit.'
// const stringValue = 'I never came to the beach'

class Race extends PureComponent {
  state = {
    longText: '',
    userInput: '',
    wordToMatch: '',
    words: [],
    wordsCompleted: [],
    matchedChars: [],
    countDownTimer: 0,
    raceStatus: raceStatusConf.IDLE,
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
      const countDownTimer = !state.countDownTimer ? this.props.raceCountdown : state.countDownTimer - 1
      return { countDownTimer }
    }, () => {
      const { countDownTimer } = this.state

      if (countDownTimer) {
        setTimeout(this.countDown, 0)
      } else {
        this.startRace()
      }
    })
  }

  startRace () {
    this.setState(state => ({
      raceStatus: raceStatusConf.ONGOING,
      wordToMatch: state.words[0],
      remainingTime: this.props.raceTimeLimit + 1
    }), () => {
      const textBox = document.querySelector('#text-box')
      textBox.focus()
      this.updateRaceTime()
    })
  }

  updateRaceTime = () => {
    this.setState(
      ({ remainingTime }) => ({ remainingTime: --remainingTime }),
      () => {
        if (this.state.remainingTime > 0) {
          this.raceTimer = setTimeout(this.updateRaceTime, 1000)
        } else {
          this.endRace()
        }
      })
  }

  endRace () {
    clearTimeout(this.raceTimer)
    this.setState({
      raceStatus: raceStatusConf.END,
      raceResult: this.getWpm()
    })
  }

  getWpm () {
    const { wordsCompleted, matchedChars, remainingTime } = this.state
    const text = wordsCompleted.join('') + matchedChars.join('')
    const time = this.props.raceTimeLimit - remainingTime
    const wpm = (text.length / 5) * 60 / time

    return (wpm > 0) ? Math.round(wpm) + ' wpm' : ''
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
    }, () => {
      const { wordsCompleted, words } = this.state
      if (wordsCompleted.length === words.length) {
        this.endRace()
      }
    })
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
        <span className="ant-typography ant-typography-success">{wordsCompleted}</span>
        {<span className={classnames('ant-typography', fontColor)}>{currentWord}</span>}
        {remaining}
      </>
    )
  }

  render () {
    const { IDLE, ONGOING, END } = raceStatusConf
    const { wordToMatch = '', words, wordsCompleted, countDownTimer, userInput, remainingTime, raceStatus } = this.state
    let alert = null

    if (raceStatus === END) {
      alert = (words.length === wordsCompleted.length) ? (
        <Alert
          className="text-center mb-3"
          type="success"
          message="Awesome you completed the game!"
        />
      ) : (
        <Alert
          className="text-center mb-3"
          type="info"
          message="Sorry, you run out of time."
        />
      )
    }

    const raceBox = (
      <div className={classnames({ 'd-none': raceStatus === IDLE })}>
        <div className={classes.longText}>{this.currentWord()}</div>
        {raceStatus !== END && <Input
          value={userInput}
          onChange={this.userInputOnChange}
          maxLength={wordToMatch.length + 5}
          id="text-box"
          size="large"
          autoCorrect="off"
          autoCapitalize="off"
        />}
      </div>
    )

    let time = null
    let meter = null
    if (raceStatus !== IDLE) {
      time = (
        <Col span={12} className={classes.time}>
          <ClockCircleOutlined /> {remainingTime}
        </Col>
      )
      meter = (
        <Col span={12} className={classes.meter}>
          <DashboardOutlined /> {this.getWpm()}
        </Col>
      )
    }

    const buttonLabel = raceStatus !== END ? 'Start Race' : 'Start a New Race'

    return (
      <Layout>
        <div className="text-center">
          {raceStatus !== ONGOING && <Button
            onClick={this.initRace}
            className={classes.startBtn}
            size="large"
            type="primary"
          >{buttonLabel}</Button>}
          {!!countDownTimer && <div>{countDownTimer}</div>}
        </div>
        <div className={classnames(classes.raceBox)}>
          {alert}
          <Row className={classes.ticker}>
            {time}
            {meter}
          </Row>
          {raceBox}
        </div>
      </Layout>
    )
  }
}

Race.defaultProps = {
  raceTimeLimit: raceTimeLimit,
  raceCountdown: raceCountdown
}

const appState = ({ isAuthenticated }) => {
  return { isAuthenticated }
}
export default _flow([
  withRouter,
  connectToApp(appState)
])(Race)