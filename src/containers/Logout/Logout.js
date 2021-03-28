import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { Typography } from 'antd'
import _flow from 'lodash.flow'

import appRoute from '@config/app-routes'
import { connect as connectToApp } from '@providers/app'

const { Title, Paragraph } = Typography

class Logout extends PureComponent {
  componentDidMount () {
    localStorage.removeItem('accessToken')
    this.props.logout()

    setTimeout(() => {
      this.props.history.replace(appRoute.login)
    }, 3000)
  }

  render () {
    return (
      <>
        <Title level={2} className="text-center">Thanks you for visiting!</Title>
        <Title level={4} className="text-center">You will be redirected to login page in a while.</Title>
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consequat luctus. Donec ac aliquam eros. Proin at rhoncus turpis, id cursus augue. Duis vel ullamcorper justo. Nunc quis urna posuere, porttitor risus ut, rutrum nunc. Ut faucibus molestie risus, eu bibendum ante. Nam pretium vel odio ac posuere. In consequat dui at tortor tristique mollis. Integer sit amet orci mauris.
          Sed ullamcorper sapien ac orci vestibulum vehicula. Etiam sagittis tincidunt ullamcorper. Duis mauris nisi, finibus at risus vel, vestibulum fringilla magna. Vestibulum lobortis lobortis pretium. Integer sed ultrices felis, eget sollicitudin erat. Duis in dolor id quam malesuada suscipit. Integer sit amet gravida justo, sit amet euismod erat. Pellentesque hendrerit nunc nec dictum eleifend.
        </Paragraph>
        <Paragraph>
          Mauris quis eleifend eros. Nunc elementum felis eget purus dignissim mollis. Ut pellentesque imperdiet ante id feugiat. Ut et arcu felis. Integer fermentum tincidunt porta. Suspendisse ut quam nec ipsum rutrum mattis sed a nisi. Nullam vestibulum lorem ipsum, et pulvinar turpis varius id. Sed orci odio, rutrum a enim a, finibus sollicitudin dui. Donec justo leo, porttitor sed lorem a, convallis tempus ipsum. Integer id elit risus.
        </Paragraph>
        <Paragraph>
          Nam blandit metus a vestibulum tincidunt. Praesent hendrerit lacus euismod pharetra viverra. Etiam luctus ornare ex, ac semper arcu efficitur id. Vivamus sodales enim ut semper bibendum. Donec non porta lacus, id interdum lorem. Curabitur in varius nisl, ac hendrerit dui. Pellentesque maximus congue finibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </Paragraph>
      </>
    )
  }
}

const appMethods = ({ logout }) => {
  return { logout }
}
export default _flow([
  withRouter,
  connectToApp(null, appMethods)
])(Logout)