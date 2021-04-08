import React, { memo } from 'react'
import { Avatar, Card, Skeleton } from 'antd'
import { UserOutlined, ClockCircleOutlined, DashboardOutlined, CalendarOutlined } from '@ant-design/icons'
import moment from 'moment'
import _flow from 'lodash.flow'

import classes from './UserProfile.scss'
import { LOADING } from '@config/constant'
import { dateFormat } from '@config/collection'
import { connect as connectToApp } from '@providers/app'

const UserProfile = (props) => {
  const { user, fetchStatus, stats } = props
  const { averageWpm, averageTime, dateFrom, dateTo } = stats

  const wpm = (
    <>
      <div>
        <DashboardOutlined /> Average wpm
      </div>
      {fetchStatus === LOADING ? (
        <Skeleton.Button active size="small" shape="round" />
      ) : `${averageWpm} wpm`}
    </>
  )
  const time = (
    <>
      <div>
        <ClockCircleOutlined /> Average Time
      </div>
      {fetchStatus === LOADING ? (
        <Skeleton.Button active size="small" shape="round" />
      ) : `${averageTime} second(s)`}
    </>
  )
  const coverage = (
    <>
      <div>
        <CalendarOutlined /> Stats Coverage
      </div>
      {fetchStatus === LOADING ? (
        <Skeleton.Button active size="small" shape="round" />
      ) : (
        dateFrom && <div>{moment(dateFrom).format(dateFormat.client)} - {moment(dateTo).format(dateFormat.client)}</div>
      )}
    </>
  )

  return (
    <Card
      actions={[
        coverage,
        wpm,
        time
      ]}
      className={classes.userProfile}
    >
      <Card.Meta
        avatar={<Avatar size={64} icon={<UserOutlined />} />}
        title={user.username}
        description={(
          <div>Name: {user.firstName} {user.lastName}</div>
        )}
      />
    </Card>
  )
}

const appState = ({ user }) => {
  return { user }
}
export default _flow([
  memo,
  connectToApp(appState)
])(UserProfile)