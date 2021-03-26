import React, { Suspense, PureComponent } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Icon, message } from 'antd'
import classnames from 'classnames'
import _pick from 'lodash.pick'
import jwtDecode from 'jwt-decode'

import '@assets/styles/index.scss'
import appRoutes from '@config/app-routes'
import { AppContext } from '@providers/app'
import ComponentLoader from '@components/shared/ComponentLoader/ComponentLoader'
import SecureRoute from '@containers/SecureRoute/SecureRoute'

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
const Logout = ComponentLoader({
  loader: () => import('@containers/Logout/Logout')
})
const Home = ComponentLoader({
  loader: () => import('@containers/Home/Home')
})
const Page404 = ComponentLoader({
  loader: () => import('@containers/Page404/Page404')
})

class App extends PureComponent {
  constructor (props) {
    super(props)
    this.contextMethods = _pick(this, [
      'authCompelete',
      'logout'
    ])
    this.state = {
      isAuthenticated: false,
      user: {}
    }
  }

  authCompelete = (token) => {
    try {
      const user = jwtDecode(token)
      localStorage.setItem('accessToken', token)
      this.setState({
        user,
        isAuthenticated: true
      })
      message.destroy()
    } catch (e) {
      message.error('Something went wrong. Please try again.')
    }
  }

  logout = () => {
    this.setState({
      user: {},
      isAuthenticated: false
    })
  }

  componentDidMount () {
    if (this.state.isAuthenticated) {
      this.preload()
    }

    window.addEventListener('storage', ({ key, newValue }) => {
      if (key === 'accessToken') {
        if (!newValue) {
          window.location.href = appRoutes.login
        } else if (window.location.pathname === appRoutes.login) {
          window.location.href = appRoutes.home
        }
      }
    })
  }

  render () {
    const { isAuthenticated, user } = this.state

    if (isAuthenticated && !user._id) {
      return <PreLoader />
    }

    return (
      <AppContext.Provider value={{
        method: this.contextMethods,
        state: this.state
      }}>
        <Suspense fallback={<PreLoader />}>
          <Switch>
            <Route path={appRoutes.login}>
              { isAuthenticated ? <Redirect to={appRoutes.home} /> : <Login /> }
            </Route>
            <Route path={appRoutes.pageNotFound} component={Page404} />
            <Route exact path={appRoutes.logout} component={Logout} />
            <SecureRoute exact path={appRoutes.home} component={Home} />
            <Redirect to={appRoutes.pageNotFound} />
          </Switch>
        </Suspense>
      </AppContext.Provider>
    )
  }
}

export default App