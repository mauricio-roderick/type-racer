import React, { PureComponent } from 'react'
import { Row, Col, message, notification } from 'antd'
import { withRouter } from 'react-router-dom'
import querySting from 'query-string'
import axios from 'axios'
import _flow from 'lodash.flow'
import _get from 'lodash.get'

import resource from '@config/resource'
import platormApiSvc from '@services/platform-api/'
import { LOADING, IDLE } from '@config/constant'
import { handleApiError } from '@helpers/collection'
import { connect as connectToApp } from '@providers/app'
import RaceHistory from '@components/Race/History/History'
import UserProfile from '@components/Race/UserProfile/UserProfile'
import TypeRace from '@components/TypeRace/TypeRace'

const { CancelToken } = axios

export class Race extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      raceHistory: [],
      totalRaceHistory: 0,
      fetchRaceHistoryStatus: IDLE,
      userStats: {},
      fetchUserStatsStatus: IDLE,
      parsedQueryParams: {},
      stats: {}
    }
  }

  static getDerivedStateFromProps (props) {
    return {
      parsedQueryParams: querySting.parse(props.location.search, {
        parseNumbers: true
      })
    }
  }

  componentDidMount () {
    this.getRaceHistory()
    this.getUserStats()
  }

  componentDidUpdate (prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.getRaceHistory()
    }
  }

  componentWillUnmount () {
    if (this.cancelRaceHistoryRequest) {
      this.cancelRaceHistoryRequest()
    }
    if (this.cancelUserStatsRequest) {
      this.cancelUserStatsRequest()
    }
  }

  async getUserStats () {
    this.setState({ fetchUserStatsStatus: LOADING })
    try {
      const { data } = await platormApiSvc.get(resource.raceHistory + '/recent-stats', {
        cancelToken: new CancelToken(cancelFunc => {
          this.cancelUserStatsRequest = cancelFunc
        })
      })
      this.setState({
        fetchUserStatsStatus: IDLE,
        userStats: data
      })
    } catch (e) {
      handleApiError(e, () => {
        message.error('Failed to retrieve User Stats.')
        this.setState({ fetchUserStatsStatus: IDLE })
      })
    }
  }

  async getRaceHistory () {
    let { page } = this.state.parsedQueryParams
    page = isNaN(page) ? undefined : (page - 1)

    this.setState({ fetchRaceHistoryStatus: LOADING })
    try {
      const { data } = await platormApiSvc.get(resource.raceHistory, {
        cancelToken: new CancelToken(cancelFunc => {
          this.cancelRaceHistoryRequest = cancelFunc
        }),
        params: { page }
      })
      const { totalRecords } = data.meta

      this.setState({
        fetchRaceHistoryStatus: IDLE,
        raceHistory: data.raceHistory,
        totalRaceHistory: totalRecords
      })
    } catch (e) {
      handleApiError(e, () => {
        message.error('Failed to retrieve race history.')
        this.setState({ fetchRaceHistoryStatus: IDLE })
      })
    }
  }

  saveRaceResult = async (raceStats) => {
    const { user } = this.props

    try {
      await platormApiSvc.post(resource.raceHistory, {
        ...raceStats,
        user: user._id
      })

      notification.success({
        message: 'Race successfully Saved',
        description: 'Your new record has been added to your race history.'
      })

      this.getUserStats()
      if (_get(this.state, 'parsedQueryParams.page', 1) === 1) {
        this.getRaceHistory()
      }
    } catch (e) {
      message.warning('Failed to save race result.')
    }
  }

  render () {
    const { raceHistory, totalRaceHistory, fetchRaceHistoryStatus, userStats, fetchUserStatsStatus, parsedQueryParams } = this.state

    return (
      <Row align="top">
        <Col xl={12} lg={24}>
          <TypeRace onRaceComplete={this.saveRaceResult} />
        </Col>
        <Col xl={12} lg={24}>
          <UserProfile
            stats={userStats}
            fetchStatus={fetchUserStatsStatus}
          />
          <RaceHistory
            records={raceHistory}
            totalRecords={totalRaceHistory}
            fetchStatus={fetchRaceHistoryStatus}
            queryParams={parsedQueryParams}
          />
        </Col>
      </Row>
    )
  }
}

const appState = ({ user }) => {
  return { user }
}
export default _flow([
  withRouter,
  connectToApp(appState)
])(Race)