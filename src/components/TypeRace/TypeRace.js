import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Input, Button, Alert, Progress, Typography, message } from 'antd'
import { ClockCircleOutlined, DashboardOutlined, Loading3QuartersOutlined, FlagOutlined, TrophyOutlined, FieldTimeOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import _get from 'lodash.get'
import _isFunction from 'lodash.isfunction'
import axios from 'axios'

import classes from './TypeRace.scss'
import resource from '@config/resource'
import { stringDiff, handleApiError } from '@helpers/collection'
import { raceStatus as raceStatusConf } from '@config/constant'
import { raceTimeLimit, raceCountdown, wordsCount, countDownLabels } from '@config/collection'
import platormApiSvc from '@services/platform-api/'
import Timer from '@components/Race/Timer/Timer'

const { CancelToken } = axios
const { Title } = Typography

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
      wordsCompleted: 0,
      matchedText: '',
      countDownTimer: 0,
      raceNotif: null,
      raceStatus: raceStatusConf.IDLE
    }
  }

  componentWillUnmount () {
    if (this.cancelGetRandomTextRequest) {
      this.cancelGetRandomTextRequest()
    }
    clearTimeout(this.raceTimer)
  }

  async getRandomText () {
    return await platormApiSvc.get(resource.randomText, {
      cancelToken: new CancelToken(cancelFunc => {
        this.cancelGetRandomTextRequest = cancelFunc
      }),
      params: {
        words: wordsCount
      }
    })
  }

  initRace = async () => {
    this.setState({
      ...this.defaultState,
      raceStatus: raceStatusConf.INIT
    })

    try {
      const { data } = await this.getRandomText()
      const longText = data.text
      const words = longText.split(' ')

      this.setState({
        words,
        longText: longText,
        raceStatus: raceStatusConf.COUNTDOWN
      })
      this.countDown()
    } catch (e) {
      handleApiError(e, () => {
        message.error('Failed to initialize game.')
        this.setState({ raceStatus: raceStatusConf.IDLE })
      })
    }
  }

  countDown = () => {
    this.setState((state, props) => {
      const countDownTimer = !state.countDownTimer ? props.raceCountdown : state.countDownTimer - 1
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
    this.setState(({ words, wordsCompleted }, { raceTimeLimit }) => ({
      textToMatch: words[0] + this.prependSpace(words.length, wordsCompleted),
      raceStatus: raceStatusConf.ONGOING,
      remainingTime: raceTimeLimit + 1
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
      if (words.length === wordsCompleted) {
        raceNotif = {
          message: <Title level={4} className="m-0">Awesome</Title>,
          description: 'You completed the race!',
          showIcon: true,
          icon: <TrophyOutlined />,
          type: 'success'
        }
      } else {
        raceNotif = {
          message: <Title level={4} className="m-0">Time&apos;s Up</Title>,
          description: 'Sorry, you ran out of time.',
          showIcon: true,
          icon: <FieldTimeOutlined />,
          type: 'error'
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
    const { words, wordsCompleted, matchedText, remainingTime = 0 } = this.state
    const { raceTimeLimit } = this.props
    const text = [...words].splice(0, wordsCompleted).join(' ') + matchedText
    const time = raceTimeLimit - remainingTime
    const wpm = text.length ? (text.length / 5) * 60 / time : 0

    return {
      wpm: Math.round(wpm),
      time,
      textLength: text.length
    }
  }

  prependSpace (totalWords, wordsCompleted) {
    return wordsCompleted !== (totalWords - 1) ? ' ' : ''
  }

  userInputOnChange = (e) => {
    const { value } = e.target
    this.setState(state => {
      const { textToMatch, words } = state

      let stateUpdate = {
        userInput: value
      }

      if (value === textToMatch) {
        const wordsCompleted = state.wordsCompleted + 1
        stateUpdate = {
          wordsCompleted,
          userInput: '',
          matchedText: '',
          textToMatch: words[wordsCompleted] + this.prependSpace(words.length, wordsCompleted)
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
      if (wordsCompleted === words.length) {
        this.endRace()
      }
    })
  }

  textProgress () {
    const { userInput, words, wordsCompleted } = this.state
    let currentWord = words[wordsCompleted] || ''
    const overflow = userInput.length - currentWord.length
    const prependSpace = this.prependSpace(words.length, wordsCompleted)
    let remaining = prependSpace + [...words].splice(wordsCompleted + 1).join(' ')

    if (userInput) {
      const matchedText = stringDiff(userInput, currentWord)

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
        <span className="ant-typography ant-typography-success">{[...words].splice(0, wordsCompleted).join(' ')}</span>
        {wordsCompleted ? ' ' : ''}
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

    if (![ONGOING, END].includes(raceStatus)) return null

    const { textLength } = this.getRaceStats()
    const hasTypo = matchedText.length < userInput.length
    const percentage = (textLength / longText.length) * 100

    return (
      <>
        <Progress className="my-2" percent={Math.floor(percentage)} />
        <div className={classnames(classes.textProgress)}>{this.textProgress()}</div>
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

    if (raceStatus !== raceStatusConf.IDLE) {
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
    const { IDLE, ONGOING, END } = raceStatusConf
    const { raceStatus } = this.state

    const startButton = [IDLE, END].includes(raceStatus) ? (
      <Button
        onClick={this.initRace}
        className={classes.raceButton}
        type="primary"
        size="large"
      >
        <FlagOutlined />
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
      raceStatus
    } = this.state
    const notif = raceNotif ? (
      <Alert
        {...raceNotif}
        className="mb-3"
      />
    ) : null
    const initIndicator = raceStatus === raceStatusConf.INIT ? (
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