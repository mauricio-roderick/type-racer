import React, { Suspense, Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Icon } from 'antd';
import classnames from 'classnames';

import ComponentLoader from '@components/shared/ComponentLoader/ComponentLoader';
// import '@assets/styles/index.scss';
import appRoutes from '@config/app-routes';

const PreLoader = () => (
  <div className="root-preloader">
    <div className="logo">{process.env.APP_NAME}</div>
    <Icon
      spin
      type="loading-3-quarters"
      className={classnames('mt-2')}
    />
  </div>
);

const Login = ComponentLoader({
  loader: () => import('@containers/Login/Login')
});

class App extends Component {
  state = {
    isLoggedIn: false,
    user: {}
  }

  componentDidMount () {
    if (this.state.isLoggedIn) {
      this.preload();
    }

    window.addEventListener('storage', ({ key, newValue }) => {
      if (key === 'accessToken') {
        if (!newValue) {
          window.location.href = '/login';
        } else if (window.location.pathname === appRoutes.login) {
          window.location.href = '/';
        }
      }
    });
  }

  componentDidUpdate (prevProps) {
    // const { isLoggedIn } = this.props.user;

    // if (isLoggedIn && isLoggedIn !== prevProps.user.isLoggedIn) {
    //   this.preload();
    // }
  }

  render () {
    const { isLoggedIn, user } = this.state;

    if (isLoggedIn && !user.id) {
      return <PreLoader />;
    }

    const homePage = (
      <div className="text-center">Temporary Home Page</div>
    );

    return (
      <Suspense fallback={<PreLoader />}>
        <Switch>
          <Route path="/" exact >
            { isLoggedIn ? homePage : <Redirect to={appRoutes.login} /> }
          </Route>
          <Route path={appRoutes.login} component={Login} />
        </Switch>
      </Suspense>
    );
  }
}

export default App;