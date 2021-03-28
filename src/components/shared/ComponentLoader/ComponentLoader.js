import React, { Component } from 'react'
import Loadable from 'react-loadable'
import { Loading3QuartersOutlined } from '@ant-design/icons'

import classes from './ComponentLoader.scss'

class LoadingComponent extends Component {
  render () {
    const { error } = this.props
    if (error) {
      throw error
    }

    return <Loading3QuartersOutlined className={classes.loadingIcon} spin />
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