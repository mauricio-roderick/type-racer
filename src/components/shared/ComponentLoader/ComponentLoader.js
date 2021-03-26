import React, { Component } from 'react'
import Loadable from 'react-loadable'
import { Spin } from 'antd'

class LoadingComponent extends Component {
  render () {
    const { error } = this.props
    if (error) {
      console.error(error)
    }

    return <Spin size="small" />
  }
}

const ComponentLoader = (options) => {
  const defaultOption = {
    loading: LoadingComponent
  }

  return Loadable({
    ...defaultOption,
    ...options
  })
}

export default ComponentLoader