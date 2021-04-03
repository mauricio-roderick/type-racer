import React from 'react'
import { shallow } from 'enzyme'
import moxios from 'moxios'

import platormApiSvc from '@services/platform-api/'
import TypeRace from './TypeRace'
import { checkProps } from '@test/utils'

const defaultProps = {
	raceTimeLimit: 60,
	raceCountdown: 3,
  user: {
    _id: 'USER_ID'
  }
}

const setUp = (props) => {
	const setupProps = { ...defaultProps, ...props }
  const wrapper = shallow(<TypeRace {...setupProps} />)
  return wrapper
}

test('does not throw any warning with expected props', () => {
	const expectedProps = { ...defaultProps }
	checkProps(TypeRace, expectedProps)
})

describe('On load', () => {
  let wrapper

  beforeEach(() => {
    wrapper = setUp()
	})
  it('matching default state', () => {
    const state = wrapper.state()
    const expectedState = {
      longText: '',
      userInput: '',
      textToMatch: '',
      words: [],
      matchedText: '',
      wordsCompleted: [],
      countDownTimer: 0,
      raceNotif: null,
      raceStatus: 'IDLE',
      gameInitStatus: 'IDLE'
    }
    expect(expectedState).toStrictEqual(state)
  })
})

describe('Race init', () => {
  const randomText = 'The quick brown fox jump over the lazy dog.'
  let wrapper

  beforeEach(() => {
    moxios.install(platormApiSvc)
    wrapper = setUp()
	})
  afterEach(() => {
		moxios.uninstall(platormApiSvc)
	})
  it('save random text from API to state', function (done) {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()

      request.respondWith({
        status: 200,
        response: { text: randomText }
      })
      .then(function () {
        const { longText, words } = wrapper.state()
				expect(longText).toBe(randomText)
				expect(words.join('')).toBe(randomText)
        done()
      })
    })

    const instance = wrapper.instance()
    instance.initRace()
  })
  it('switch back to idle on failed API call', function (done) {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({
        status: 400
      })
      .then(function () {
        const { words, longText, gameInitStatus, raceStatus } = wrapper.state()
        expect(longText).toBe('')
        expect(raceStatus).toBe('IDLE')
        expect(words).toStrictEqual([])
        expect(gameInitStatus).toBe('IDLE')
        done()
      })
    })

    const instance = wrapper.instance()
    instance.initRace()
  })
})