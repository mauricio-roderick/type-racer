import React, { PureComponent } from 'react'
import { Row, Col, Input, Button, Alert, Table, message, notification } from 'antd'
import { ClockCircleOutlined, DashboardOutlined, Loading3QuartersOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import _flow from 'lodash.flow'
import classnames from 'classnames'
import moment from 'moment'

import classes from './Race.scss'
import resource from '@config/resource'
import { LOADING, IDLE, raceStatus as raceStatusConf } from '@config/constant'
import { raceTimeLimit, raceCountdown, dateTimeFormat } from '@config/collection'
import platormApiSvc from '@services/platform-api/'
import { connect as connectToApp } from '@providers/app'
import Layout from '@containers/Layout/Layout'

// const stringValue = "I never came to the beach or stood by the ocean, I never sat by the shore under the sun with my feet in the sand, but you brought me here and I'm happy that you did."
// const stringValue = 'Never ever quit.'
const stringValue = 'I never came to the beach'

export class Race extends PureComponent {
  state = {
    ...this.defaultState
  }

  get defaultState () {
    return {
      longText: '',
      userInput: '',
      wordToMatch: '',
      words: [],
      raceHistory: [],
      wordsCompleted: [],
      matchedChars: [],
      countDownTimer: 0,
      raceStatus: raceStatusConf.IDLE,
      gameInitStatus: IDLE
    }
  }

  componentDidMount () {
    this.getRaceHistory()
  }

  async getuserInput () {
    return stringValue
  }

  async getRaceHistory () {
    this.setState({ fetchHistoryStatus: LOADING })
    const stateUpdate = {
      fetchHistoryStatus: IDLE
    }
    try {
      const { data } = await platormApiSvc.get(resource.race)
      stateUpdate.raceHistory = data.raceHistory
    } catch (e) {
      message.warning('Failed to save your race.')
    }

    this.setState(stateUpdate)
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
      let longText = await this.getuserInput()
      longText = longText.trim()
      const words = longText.split(' ')

      stateUpdate.longText = longText
      stateUpdate.words = words.map((word, i) => i !== (words.length - 1) ? word + ' ' : word)
      this.countDown()
    } catch (e) {}

    this.setState(stateUpdate)
  }

  async saveRaceResult () {
    const { user } = this.props
    const raceStats = this.getRaceStats()

    try {
      platormApiSvc.post(resource.race, {
        ...raceStats,
        user: user._id
      })

      notification.success({
        message: 'Race successfully Saved',
        description: 'Your new record has been added to your race history.'
      })
    } catch (e) {
      message.warning('Failed to save your race.')
    }
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

  renderRaceHistory () {
    const { fetchHistoryStatus, raceHistory } = this.state
    const columns = [{
      title: 'wpm',
      dataIndex: 'wpm'
    }, {
      title: 'Date',
      dataIndex: 'timestamp',
      render: timestamp => moment(timestamp).format(dateTimeFormat.client)
    }]
    return fetchHistoryStatus !== LOADING ? (
      <Table columns={columns} dataSource={raceHistory} />
    ) : <Loading3QuartersOutlined className={classes.raceHistoryLoader} spin />
  }

  render () {
    const { IDLE, ONGOING, END } = raceStatusConf
    const {
      wordToMatch = '',
      words,
      wordsCompleted,
      countDownTimer,
      userInput,
      remainingTime,
      raceStatus,
      matchedChars
    } = this.state
    const hasTypo = matchedChars.length < userInput.length
    const { wpm } = this.getRaceStats()
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
          message="Sorry, you ran out of time."
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
          className={classnames(classes.textBox, hasTypo ? classes.hasTypo : '')}
          id="text-box"
          size="large"
          autoCorrect="off"
          autoComplete="off"
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
          <DashboardOutlined /> {wpm} wpm
        </Col>
      )
    }

    const buttonLabel = raceStatus !== END ? 'Start Race' : 'Start a New Race'

    return (
      <Layout>
        <Row>
          <Col xl={12} lg={24}>
            <div className={classnames(classes.raceBox)}>
              <div className="text-center mb-4">
                {raceStatus !== ONGOING && <Button
                  onClick={this.initRace}
                  className={classes.startBtn}
                  size="large"
                  type="primary"
                >{buttonLabel}</Button>}
                {!!countDownTimer && <div>{countDownTimer}</div>}
              </div>
              {alert}
              <Row className={classes.ticker}>
                {time}
                {meter}
              </Row>
              {raceBox}
            </div>
          </Col>
          <Col xl={12} lg={24}>
            {this.renderRaceHistory()}
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