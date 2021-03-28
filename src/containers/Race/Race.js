import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Input, Button, Alert, Progress, message, notification } from 'antd'
import { ClockCircleOutlined, DashboardOutlined, Loading3QuartersOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import classnames from 'classnames'
import _flow from 'lodash.flow'
import _get from 'lodash.get'

import classes from './Race.scss'
import resource from '@config/resource'
import { LOADING, IDLE, raceStatus as raceStatusConf } from '@config/constant'
import { raceTimeLimit, raceCountdown, wordsCount, countDownLabels } from '@config/collection'
import platormApiSvc from '@services/platform-api/'
import { connect as connectToApp } from '@providers/app'
import RaceHistory from '@components/Race/History/History'
import Timer from '@components/Race/Timer/Timer'
import UserProfile from '@components/Race/UserProfile/UserProfile'

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
      raceNotif: null,
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
        words: wordsCount
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
    } catch (e) {
      message.error('Failed to initialize game.')
    }

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
      this.setState({ refreshKey: Date.now() })
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

  endRace (userInitiated = false) {
    clearTimeout(this.raceTimer)

    const { words, wordsCompleted } = this.state
    let raceNotif

    if (!userInitiated) {
      if (words.length === wordsCompleted.length) {
        raceNotif = {
          message: 'Awesome, you completed the race!',
          type: 'success'
        }
      } else {
        raceNotif = {
          message: 'Sorry, you ran out of time.',
          type: 'info'
        }
      }
    }

    this.setState({
      raceNotif,
      raceStatus: raceStatusConf.END
    })

    if (!userInitiated) {
      this.saveRaceResult()
    }
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

  textProgress () {
    const { wordToMatch = '', userInput, words, wordsCompleted } = this.state
    let textProgress = wordToMatch.trim()
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

      textProgress = textProgress.split('')
      const matchedPortion = textProgress.splice(0, matchCount)
      const unmatchedPortion = textProgress.splice(0, userInput.length - matchedPortion.length)

      textProgress = (
        <>
          <b>{matchedPortion}</b>
          <span className={classes.unmatched}>{unmatchedPortion}</span>
          {textProgress}
        </>
      )
    }

    const remaining = [...words].splice(wordsCompleted.length + 1)
    return (
      <>
        <span className="ant-typography ant-typography-success">{wordsCompleted}</span>
        {<span className={classnames(classes.currentWord, 'ant-typography', fontColor)}>{textProgress}</span>}
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
      matchedChars,
      longText
    } = this.state
    const { textLength } = this.getRaceStats()
    const hasTypo = matchedChars.length < userInput.length
    const percentage = (textLength / longText.length) * 100

    return (
      <>
        {[ONGOING, END].includes(raceStatus) && (
          <div className={classnames(classes.longText)}>
            <Progress className="my-2" percent={Math.floor(percentage)} />
            {this.textProgress()}
          </div>
        )}
        {raceStatus === ONGOING && <Input
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
      </>
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

  renderRaceButtons () {
    const { ONGOING, COUNTDOWN, END } = raceStatusConf
    const { raceStatus } = this.state

    const startButton = ![ONGOING, COUNTDOWN].includes(raceStatus) ? (
      <Button
        onClick={this.initRace}
        className={classes.raceButton}
        type="primary"
        size="large"
      >
        {(raceStatus !== END) ? 'Start Race' : 'Start a New Race'}
      </Button>
    ) : null

    const endRace = raceStatus === ONGOING ? (
      <Button
        onClick={() => this.endRace(true)}
        className={classes.raceButton}
        type="primary"
        size="large"
        danger
      >
        End Race
      </Button>
    ) : null

    return (
      <div className="text-center mb-4">
        {startButton}
        {endRace}
      </div>
    )
  }

  render () {
    const {
      countDownTimer,
      raceNotif,
      refreshKey,
      gameInitStatus
    } = this.state
    const notif = raceNotif ? (
      <Alert
        {...raceNotif}
        className="text-center mb-3"
      />
    ) : null
    const initIndicator = gameInitStatus === LOADING ? (
      <Loading3QuartersOutlined className={classes.initIcon} spin />
    ) : null

    return (
      <>
        <Row align="top">
          <Col xl={12} lg={24}>
            <div className={classnames(classes.raceBox)}>
              {notif}
              {initIndicator}
              <div className={classnames(classes.countDownTimer, 'text-center')}>
                {_get(countDownLabels, countDownTimer)}
              </div>
              {this.renderRaceButtons()}
              {this.renderTicker()}
              {this.renderRaceBox()}
            </div>
          </Col>
          <Col xl={12} lg={24}>
            <UserProfile refresh={refreshKey}/>
            <RaceHistory refresh={refreshKey}/>
          </Col>
        </Row>
      </>
    )
  }
}

Race.defaultProps = {
  raceTimeLimit: raceTimeLimit,
  raceCountdown: raceCountdown
}

Race.propTypes = {
  raceTimeLimit: PropTypes.number,
  raceCountdown: PropTypes.number,
  user: PropTypes.shape({
    _id: PropTypes.string
  })
}

const appState = ({ user }) => {
  return { user }
}
export default _flow([
  withRouter,
  connectToApp(appState)
])(Race)