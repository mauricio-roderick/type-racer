import React, { PureComponent } from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import { withRouter } from 'react-router-dom';
import _flow from 'lodash.flow';

import classes from './Login.scss';
import resource from '@config/resource';
import { handleApiError } from '@helpers/collection';
import platormApiSvc from '@services/platform-api/';
import Layout from '@containers/Layout/Layout';
// import appRoutes from '@config/app-routes';

export class Login extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {};
  }

  onSubmitHandler = async () => {
  }

  render () {
    return (
      <div className="user-login">
        Login
      </div>
    );
  }
}

class LoginForm extends React.Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, { username, password }) => {
      if (!err) {
      }

      try {
        const { data } = await platormApiSvc.post(resource.auth + '/token', {
          username,
          password
        });

        this.props.authCompelete(data);
      } catch (e) {
        handleApiError(e, () => {
          message.error('Incorrect username or password.');
        });
      }
    });
  };

  render () {
    const { getFieldDecorator } = this.props.form;
    return (
      <Layout>
        <h2 className={classes.header}>Login to {process.env.APP_NAME}</h2>
        <Form onSubmit={this.handleSubmit} className={classes.loginForm}>
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Username is required' }]
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                autoComplete="off"
                placeholder="Username"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Password is required!' }]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
              />
            )}
          </Form.Item>
          <Button type="primary" block htmlType="submit" className="login-form-button">
            Log in
          </Button>
        </Form>
      </Layout>
    );
  }
}

const WrappedLoginForm = Form.create({ name: 'normal_login' })(LoginForm);

export default _flow([
  withRouter
])(WrappedLoginForm);