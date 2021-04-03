import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Input, Button, Alert, Progress, message } from 'antd'
import { ClockCircleOutlined, DashboardOutlined, Loading3QuartersOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import _get from 'lodash.get'
import _isFunction from 'lodash.isfunction'

import classes from './TypeRace.scss'
import resource from '@config/resource'
import { stringDiff } from '@helpers/collection'
import { LOADING, IDLE, raceStatus as raceStatusConf } from '@config/constant'
import { raceTimeLimit, raceCountdown, wordsCount, countDownLabels } from '@config/collection'
import platormApiSvc from '@services/platform-api/'
import Timer from '@components/Race/Timer/Timer'

class TypeRace extends PureComponent {
  state = {
    ...this.defaultState
  }

  get defaultState () {
    return {
      longText: '',
      userInput: '',
      textToMatch: '',
      words: [],
      wordsCompleted: [],
      matchedText: '',
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
      textToMatch: state.words[0],
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
    const { onRaceComplete } = this.props
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
      if (_isFunction(onRaceComplete)) {
        onRaceComplete(this.getRaceStats())
      }
    }
  }

  getRaceStats () {
    const { wordsCompleted, matchedText, remainingTime = 0 } = this.state
    const { raceTimeLimit } = this.props
    const text = wordsCompleted.join('') + matchedText
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
      const { textToMatch, words } = state

      let stateUpdate = {
        userInput: value
      }

      if (value === textToMatch) {
        const wordsCompleted = [...this.state.wordsCompleted, textToMatch]
        stateUpdate = {
          userInput: '',
          matchedText: '',
          wordsCompleted: wordsCompleted,
          textToMatch: words[wordsCompleted.length]
        }
      } else {
        const matchedText = stringDiff(value, textToMatch)

        if (matchedText.length > this.state.matchedText.length) {
          stateUpdate.matchedText = matchedText
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
    const { textToMatch = '', userInput, words, wordsCompleted } = this.state
    let currentWord = textToMatch.trim()
    const wordSpace = (wordsCompleted.length < (words.length - 1)) ? ' ' : ''
    const overflow = userInput.length - currentWord.length
    let remaining = wordSpace + [...words].splice(wordsCompleted.length + 1).join(' ')

    if (userInput) {
      const matchedText = stringDiff(userInput, textToMatch)

      const unmatchedText = currentWord.substr(matchedText.length, userInput.length - matchedText.length)
      const remainingText = currentWord.substr(userInput.length)

      currentWord = (
        <>
          {matchedText && <span className={classes.matched}>{matchedText}</span>}
          {unmatchedText && <span className={classes.unmatched}>{unmatchedText}</span>}
          {remainingText}
        </>
      )
    }

    if (overflow > 0) {
      const unmatchedOveflow = remaining.substr(0, overflow)
      remaining = (
        <>
          {!!unmatchedOveflow && <span className={classes.unmatched}>{unmatchedOveflow}</span>}
          {remaining.substr(overflow)}
        </>
      )
    }

    return (
      <>
        {!!wordsCompleted.length && <span className="ant-typography ant-typography-success">{wordsCompleted}</span>}
        {<span className={classnames(classes.currentWord, 'ant-typography')}>{currentWord}</span>}
        {remaining}
      </>
    )
  }

  renderRaceBox () {
    const { ONGOING, END } = raceStatusConf
    const {
      textToMatch = '',
      userInput,
      raceStatus,
      matchedText,
      longText
    } = this.state
    const { textLength } = this.getRaceStats()
    const hasTypo = matchedText.length < userInput.length
    const percentage = (textLength / longText.length) * 100

    return (
      <>
        {[ONGOING, END].includes(raceStatus) && (
          <>
            <Progress className="my-2" percent={Math.floor(percentage)} />
            <div className={classnames(classes.textProgress)}>
              {this.textProgress()}
            </div>
          </>
        )}
        {raceStatus === ONGOING && <Input
          value={userInput}
          onChange={this.userInputOnChange}
          maxLength={textToMatch.length + 5}
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
      </>
    )
  }
}

TypeRace.defaultProps = {
  raceTimeLimit: raceTimeLimit,
  raceCountdown: raceCountdown,
  onRaceComplete: () => {}
}

TypeRace.propTypes = {
  raceTimeLimit: PropTypes.number,
  raceCountdown: PropTypes.number,
  onRaceComplete: PropTypes.func,
  user: PropTypes.shape({
    _id: PropTypes.string
  })
}

export default TypeRace