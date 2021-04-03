import axios from 'axios'
import _get from 'lodash.get'

export const handleApiError = (e, cb) => {
  if (!axios.isCancel(e) && _get(e, 'response.status') !== 401) {
    cb(e)
  }
}

export const mathRound = (value, decimalPlaces = 2) => {
  const decimalPlace = Math.pow(10, decimalPlaces)
  return Math.round((value + Number.EPSILON) * decimalPlace) / decimalPlace
}

export const stringDiff = (input = '', stringToMatch = '') => {
  let matchedText = '';

  [...input].every((char, i) => {
    const matched = char === stringToMatch.charAt(i)
    if (matched) matchedText += char
    return matched
  })

  return matchedText
}

export default {}