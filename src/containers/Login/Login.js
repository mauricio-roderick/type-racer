import React, { PureComponent } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import _flow from 'lodash.flow'
import _get from 'lodash.get'

import classes from './Login.scss'
import resource from '@config/resource'
import { notifMessage } from '@config/collection'
import platormApiSvc from '@services/platform-api/'
import { connect as connectToApp } from '@providers/app'
import Layout from '@containers/Layout/Layout'

class LoginForm extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  handleSubmit = async ({ username, password }) => {
    try {
      const { data } = await platormApiSvc.post(resource.auth + '/token', {}, {
        auth: {
          username,
          password
        }
      })

      this.props.authCompelete(data.accessToken)
    } catch (e) {
      const notifMsg = _get(e, 'response.status') === 401 ? 'Incorrect username or password.' : notifMessage.internalError
      message.error(notifMsg)
    }
  }

  render () {
    return (
      <Layout>
        <h2 className={classes.header}>Login to {process.env.APP_NAME}</h2>
        <Form
          name="normal_login"
          className={classes.loginForm}
          initialValues={{ remember: true }}
          onFinish={this.handleSubmit}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Username is required.' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Password is required.' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Log in
          </Button>
        </Form>
      </Layout>
    )
  }
}

const appMethods = ({ authCompelete }) => {
  return { authCompelete }
}
export default _flow([
  withRouter,
  connectToApp(null, appMethods)
])(LoginForm)