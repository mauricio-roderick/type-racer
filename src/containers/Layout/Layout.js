import React, { PureComponent } from 'react'
import { Layout, Menu } from 'antd'
import classes from './Layout.scss'

const { Header, Content, Footer } = Layout

class PageLayout extends PureComponent {
  render () {
    const { children } = this.props
    return (
      <Layout className={classes.layout}>
        <Header>
          <div className={classes.logo}>{process.env.APP_NAME}</div>
          <Menu
            theme="dark"
            mode="horizontal"
            className={classes.menu}
          >
            <Menu.Item key="1">Login</Menu.Item>
            <Menu.Item key="2">Play as Guest</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          {children}
        </Content>
        <Footer className="text-center">TypeRacer</Footer>
      </Layout>
    )
  }
}

export default PageLayout