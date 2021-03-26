import React from 'react'
import _isfunction from 'lodash.isfunction'

export const AppContext = React.createContext({})
AppContext.displayName = 'AppContainer'

export const connect = (stateToProps, methodToProps) => Component => props => {
  const subscriber = context => {
    let state = {}
    let method = {}
    if (_isfunction(stateToProps)) {
      state = stateToProps(context.state)
      state = (typeof state === 'object') ? state : {}
    }

    if (_isfunction(methodToProps)) {
      method = methodToProps(context.method)
      method = (typeof method === 'object') ? method : {}
    }

    return <Component {...props} {...state} {...method} />
  }

  return (
    <AppContext.Consumer>
      {context => subscriber(context)}
    </AppContext.Consumer>
  )
}