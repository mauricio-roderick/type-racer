import React, { PureComponent } from 'react'
import { Avatar, Card, message } from 'antd'
import { UserOutlined, ClockCircleOutlined, DashboardOutlined } from '@ant-design/icons'
import moment from 'moment'

import classes from './UserProfile.scss'
import { LOADING, IDLE } from '@config/constant'
import resource from '@config/resource'
import platormApiSvc from '@services/platform-api/'
import { connect as connectToApp } from '@providers/app'

class UserProfile extends PureComponent {
  state = {}

  componentDidMount () {
    this.getStats()
  }

  componentDidUpdate (prevProps) {
    const { refresh } = this.props
    if (refresh !== prevProps.refresh) {
      this.getStats()
    }
  }

  async getStats () {
    this.setState({ fetchStatStatus: LOADING })
    let stateUpdate = {
      fetchStatStatus: IDLE
    }
    try {
      const { data } = await platormApiSvc.get(resource.raceHistory + '/recent-stats')
      stateUpdate = {
        ...stateUpdate,
        ...data
      }
    } catch (e) {
      message.error('Failed to user stats. Please try reloading the page.')
    }

    this.setState(stateUpdate)
  }

  render () {
    const { user } = this.props
    const { averageWpm, averageTime, coverageDate } = this.state
    const wpm = (
      <>
        <div>
          <DashboardOutlined key="wpm" /> Average wpm
        </div>
        {averageWpm} wpm
      </>
    )
    const time = (
      <>
        <div>
          <ClockCircleOutlined key="wpm" /> Average Time
        </div>
        {averageTime} second(s)
      </>
    )

    return (
      <Card
        className={classes.userProfile}
        actions={[
          wpm,
          time
        ]}
      >
        <Card.Meta
          avatar={<Avatar size={64} icon={<UserOutlined />} />}
          title={user.username}
          description={(
            <>
              <div>Name: {user.firstName} {user.lastName}</div>
              {coverageDate && <div>Ave. Stats Coverage: {moment(coverageDate).startOf('hour').fromNow()}</div>}
            </>
          )}
        />
      </Card>
    )
  }
}

const appState = ({ user }) => {
  return { user }
}
export default connectToApp(appState)(UserProfile)