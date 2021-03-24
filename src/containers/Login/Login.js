import React, { Component } from 'react';
// import { Button, Input, Icon, notification, message } from 'antd';
import { withRouter } from 'react-router-dom';
import _flow from 'lodash.flow';
// import _get from 'lodash.get';

// import platormApiSvc from '@services/platform-api/';
// import resource from '@config/resource';
// import appRoutes from '@config/app-routes';

export class Login extends Component {
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

export default _flow([
  withRouter
])(Login);