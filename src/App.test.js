import React from 'react'
import { shallow } from 'enzyme'

import App from './App'

const setUp = (initialState) => {
  const wrapper = shallow(<App />)
  return wrapper
}

it('renders without crashing', () => {
  setUp()
})