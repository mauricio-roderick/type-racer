import React, { PureComponent } from 'react'
import { Avatar, Card } from 'antd'
import { UserOutlined, SettingOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons'
import moment from 'moment'

import classes from './UserProfile.scss'
import { dateTimeFormat } from '@config/collection'
import { connect as connectToApp } from '@providers/app'

class UserProfile extends PureComponent {
  render () {
    const { user } = this.props
    return (
      <Card
        className={classes.userProfile}
        actions={[
          <SettingOutlined key="setting" />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />
        ]}
      >
        <Card.Meta
          avatar={<Avatar size={64} icon={<UserOutlined />} />}
          title={user.username}
          description={(
            <>
              <div>Name: {user.firstName} {user.lastName}</div>
              <div>Last login: {moment(user.lastSignOn).format(dateTimeFormat.client)}</div>
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