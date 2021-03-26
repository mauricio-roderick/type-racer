import React, { PureComponent } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import _flow from 'lodash.flow'
import appRoutes from '@config/app-routes'

import classes from './Layout.scss'
import { connect as connectToApp } from '@providers/app'

const { Header, Content, Footer } = Layout

class PageLayout extends PureComponent {
  render () {
    const { children, isAuthenticated } = this.props
    const navItems = isAuthenticated ? [{
      link: appRoutes.home,
      label: 'Home'
    }, {
      link: appRoutes.logout,
      label: 'Logout'
    }] : [{
      link: appRoutes.login,
      label: 'Login'
    }]

    return (
      <Layout className={classes.layout}>
        <Header>
          <div className={classes.logo}>{process.env.APP_NAME}</div>
          <Menu
            theme="dark"
            mode="horizontal"
            className={classes.menu}
          >
            {navItems.map((nav, i) => (
              <Menu.Item key={i}>
                <Link to={nav.link}>{nav.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </Header>
        <Content className={classes.content}>
          {children}
        </Content>
        <Footer className="text-center">TypeRacer</Footer>
      </Layout>
    )
  }
}

const stateToProps = ({ isAuthenticated, user }) => {
  return { isAuthenticated, user }
}
const methodToProps = ({ logout }) => {
  return { logout }
}
export default _flow([
  withRouter,
  connectToApp(stateToProps, methodToProps)
])(PageLayout)