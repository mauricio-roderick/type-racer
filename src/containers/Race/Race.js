import React, { PureComponent } from 'react'
import { Row, Col, Input, Button, Alert, message, notification } from 'antd'
import { ClockCircleOutlined, DashboardOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import classnames from 'classnames'
import _flow from 'lodash.flow'
import _get from 'lodash.get'

import classes from './Race.scss'
import resource from '@config/resource'
import { LOADING, IDLE, raceStatus as raceStatusConf } from '@config/constant'
import { raceTimeLimit, raceCountdown, countDownLabels } from '@config/collection'
import platormApiSvc from '@services/platform-api/'
import { connect as connectToApp } from '@providers/app'
import Layout from '@containers/Layout/Layout'
import RaceHistory from '@components/Race/History/History'
import Timer from '@components/Race/Timer/Timer'
import UserProfile from '@components/Race/UserProfile/UserProfile'

// const stringValue = "I never came to the beach or stood by the ocean, I never sat by the shore under the sun with my feet in the sand, but you brought me here and I'm happy that you did."
// const stringValue = 'Never ever quit.'
// const stringValue = 'I never came to the beach'

export class Race extends PureComponent {
  state = {
    ...this.defaultState,
    raceHistory: []
  }

  get defaultState () {
    return {
      longText: '',
      userInput: '',
      wordToMatch: '',
      words: [],
      wordsCompleted: [],
      matchedChars: [],
      countDownTimer: 0,
      raceStatus: raceStatusConf.IDLE,
      gameInitStatus: IDLE
    }
  }

  componentWillUnmount () {
    clearTimeout(this.raceTimer)
  }

  async getTextValue () {
    return await platormApiSvc.get(resource.randomText, {
      params: {
        words: 30
      }
    })
  }

  initRace = async () => {
    this.setState({
      ...this.defaultState,
      gameInitStatus: LOADING
    })

    const stateUpdate = {
      gameInitStatus: IDLE
    }
    try {
      const { data } = await this.getTextValue()
      const longText = data.text
      const words = longText.split(' ')

      stateUpdate.longText = longText
      stateUpdate.words = words.map((word, i) => i !== (words.length - 1) ? word + ' ' : word)
      stateUpdate.raceStatus = raceStatusConf.COUNTDOWN
      this.countDown()
    } catch (e) {}

    this.setState(stateUpdate)
  }

  async saveRaceResult () {
    const { user } = this.props
    const raceStats = this.getRaceStats()

    try {
      await platormApiSvc.post(resource.raceHistory, {
        ...raceStats,
        user: user._id
      })

      notification.success({
        message: 'Race successfully Saved',
        description: 'Your new record has been added to your race history.'
      })
      this.setState({ historyRefresh: Date.now() })
    } catch (e) {
      message.warning('Failed to save race result.')
    }
  }

  countDown = () => {
    this.setState(state => {
      const countDownTimer = !state.countDownTimer ? this.props.raceCountdown : state.countDownTimer - 1
      return { countDownTimer }
    }, () => {
      const { countDownTimer } = this.state

      if (countDownTimer) {
        this.raceTimer = setTimeout(this.countDown, 1000)
      } else {
        this.startRace()
      }
    })
  }

  startRace () {
    this.setState(state => ({
      wordToMatch: state.words[0],
      raceStatus: raceStatusConf.ONGOING,
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
      raceStatus: raceStatusConf.END
    })

    this.saveRaceResult()
  }

  getRaceStats () {
    const { wordsCompleted, matchedChars, remainingTime = 0 } = this.state
    const { raceTimeLimit } = this.props
    const text = wordsCompleted.join('') + matchedChars.join('')
    const time = raceTimeLimit - remainingTime
    const wpm = text.length ? (text.length / 5) * 60 / time : 0

    return {
      wpm: Math.round(wpm),
      time,
      textLength: text.length
    }
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
    const { wordToMatch = '', userInput, words, wordsCompleted } = this.state
    let currentWord = wordToMatch.trim()
    let fontColor = 'ant-typography-success'
    const wordSpace = (wordsCompleted.length < (words.length - 1)) ? ' ' : ''

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

      currentWord = currentWord.split('')
      const matchedPortion = currentWord.splice(0, matchCount)
      const unmatchedPortion = currentWord.splice(0, userInput.length - matchedPortion.length)

      currentWord = (
        <>
          <b>{matchedPortion}</b>
          <span className={classes.unmatched}>{unmatchedPortion}</span>
          {currentWord}
        </>
      )
    }

    const remaining = [...words].splice(wordsCompleted.length + 1)
    return (
      <>
        <span className="ant-typography ant-typography-success">{wordsCompleted}</span>
        {<span className={classnames(classes.currentWord, 'ant-typography', fontColor)}>{currentWord}</span>}
        {wordSpace}
        {remaining}
      </>
    )
  }

  renderRaceBox () {
    const { ONGOING, END } = raceStatusConf
    const {
      wordToMatch = '',
      userInput,
      raceStatus,
      matchedChars
    } = this.state
    const hasTypo = matchedChars.length < userInput.length

    return (
      <div className={classnames({ 'd-none': raceStatus !== ONGOING })}>
        <div className={classes.longText}>{this.currentWord()}</div>
        {raceStatus !== END && <Input
          value={userInput}
          onChange={this.userInputOnChange}
          maxLength={wordToMatch.length + 5}
          className={classnames(classes.textBox, hasTypo ? classes.hasTypo : '')}
          id="text-box"
          size="large"
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
        />}
      </div>
    )
  }

  renderTicker () {
    const { raceStatus, remainingTime } = this.state
    const { wpm } = this.getRaceStats()

    let time = null
    let meter = null

    if (raceStatus !== IDLE) {
      time = (
        <Col span={12} className={classes.time}>
          <ClockCircleOutlined />{' '}
          <Timer seconds={remainingTime} />
        </Col>
      )
      meter = (
        <Col span={12} className={classes.meter}>
          <DashboardOutlined /> {wpm} wpm
        </Col>
      )
    }

    return [raceStatusConf.ONGOING, raceStatusConf.END].includes(raceStatus) ? (
      <Row className={classes.ticker}>
        {time}
        {meter}
      </Row>
    ) : null
  }

  render () {
    const { ONGOING, COUNTDOWN, END } = raceStatusConf
    const {
      words,
      wordsCompleted,
      countDownTimer,
      raceStatus,
      historyRefresh
    } = this.state
    let alert = null

    if (raceStatus === END) {
      alert = (words.length === wordsCompleted.length) ? (
        <Alert
          className="text-center mb-3"
          type="success"
          message="Awesome, you completed the game!"
        />
      ) : (
        <Alert
          className="text-center mb-3"
          type="info"
          message="Sorry, you ran out of time."
        />
      )
    }

    const buttonLabel = raceStatus !== END ? 'Start Race' : 'Start a New Race'

    return (
      <Layout>
        <Row align="top">
          <Col xl={12} lg={24}>
            <div className={classnames(classes.raceBox)}>
              {alert}
              <div className="text-center mb-4">
                {![ONGOING, COUNTDOWN].includes(raceStatus) && <Button
                  onClick={this.initRace}
                  className={classes.startBtn}
                  size="large"
                  type="primary"
                >{buttonLabel}</Button>}
                {!!countDownTimer && <div className={classes.countDownTimer}>{_get(countDownLabels, countDownTimer)}</div>}
              </div>
              {this.renderTicker()}
              {this.renderRaceBox()}
            </div>
          </Col>
          <Col xl={12} lg={24}>
            <UserProfile/>
            <RaceHistory refresh={historyRefresh}/>
          </Col>
        </Row>
      </Layout>
    )
  }
}

Race.defaultProps = {
  raceTimeLimit: raceTimeLimit,
  raceCountdown: raceCountdown
}

const appState = ({ user }) => {
  return { user }
}
export default _flow([
  withRouter,
  connectToApp(appState)
])(Race)