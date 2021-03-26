import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import _get from 'lodash.get'

import { connect as connectToApp } from '@providers/app'

function SecureRoute ({ children, isAuthenticated, ...rest }) {
  return (
    isAuthenticated ? (
      <Route {...rest}>{children}</Route>
    ) : (
      <Redirect
        to={{
          pathname: '/login',
          state: { referrer: _get(rest, 'location.pathname') }
        }}
      />
    )
  )
}

const stateToProps = ({ isAuthenticated, user }) => {
  return { isAuthenticated, user }
}

export default connectToApp(stateToProps)(SecureRoute)