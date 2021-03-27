import React from 'react'

const Timer = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60).toString()
  const remSeconds = (seconds % 60).toString()
  return (
    <span>{minutes.padStart(2, '0')}:{remSeconds.padStart(2, '0')}</span>
  )
}

export default Timer
