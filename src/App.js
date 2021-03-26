import React, { Suspense, Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Icon, message } from 'antd'
import classnames from 'classnames'
import _pick from 'lodash.pick'
import jwtDecode from 'jwt-decode'

import '@assets/styles/index.scss'
import appRoutes from '@config/app-routes'
import { AppContext } from '@providers/app'
import ComponentLoader from '@components/shared/ComponentLoader/ComponentLoader'

const PreLoader = () => (
  <div className="root-preloader">
    <div className="logo">{process.env.APP_NAME}</div>
    <Icon
      spin
      type="loading-3-quarters"
      className={classnames('mt-2')}
    />
  </div>
)

const Login = ComponentLoader({
  loader: () => import('@containers/Login/Login')
})

class App extends Component {
  constructor (props) {
    super(props)
    this.contextMethods = _pick(this, [
      'authCompelete'
    ])
    this.state = {
      isLoggedIn: false,
      user: {}
    }
  }

  authCompelete = (token) => {
    try {
      const user = jwtDecode(token)
      this.setState({ user })
    } catch (e) {
      message.error('Something went wrong. Please try again.')
    }
  }

  componentDidMount () {
    if (this.state.isLoggedIn) {
      this.preload()
    }

    window.addEventListener('storage', ({ key, newValue }) => {
      if (key === 'accessToken') {
        if (!newValue) {
          window.location.href = '/login'
        } else if (window.location.pathname === appRoutes.login) {
          window.location.href = '/'
        }
      }
    })
  }

  render () {
    const { isLoggedIn, user } = this.state

    if (isLoggedIn && !user.id) {
      return <PreLoader />
    }

    const homePage = (
      <div className="text-center">Temporary Home Page</div>
    )

    return (
      <AppContext.Provider value={{
        method: this.contextMethods,
        state: this.state
      }}>
        <Suspense fallback={<PreLoader />}>
          <Switch>
            <Route path="/" exact>
              { isLoggedIn ? homePage : <Redirect to={appRoutes.login} /> }
            </Route>
            <Route path={appRoutes.login} component={Login} />
          </Switch>
        </Suspense>
      </AppContext.Provider>
    )
  }
}

export default App