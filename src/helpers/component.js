import React from 'react'
import _get from 'lodash.get'

export const componentUpdatedValues = (cur = {}, prev = {}, path = '') => {
  return [
    _get(cur, path),
    _get(prev, path)
  ]
}

export default {}