import React, { PureComponent } from 'react'
import Layout from '@containers/Layout/Layout'

class Page404 extends PureComponent {
  render () {
    return (
      <Layout>
        <div className="text-center">Page not found</div>
      </Layout>
    )
  }
}

export default Page404