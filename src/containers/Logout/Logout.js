import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { connect as connectToApp } from '@providers/app'
import _flow from 'lodash.flow'

import Layout from '@containers/Layout/Layout'

class Logout extends PureComponent {
  componentDidMount () {
    localStorage.removeItem('accessToken')
    this.props.logout()
  }

  render () {
    return (
      <Layout>
        <div className="text-center">Logout</div>
      </Layout>
    )
  }
}

const appState = ({ isAuthenticated }) => {
  return { isAuthenticated }
}
const appMethods = ({ logout }) => {
  return { logout }
}
export default _flow([
  withRouter,
  connectToApp(appState, appMethods)
])(Logout)