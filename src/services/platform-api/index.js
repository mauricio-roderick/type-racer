import axios from 'axios'
import _get from 'lodash.get'
import { notification } from 'antd'
import * as Sentry from '@sentry/browser'

import resource from '@config/resource'
import { global } from '@config/collection'

const baseURL = process.env.PLATFORM_API_URL
const axiosInstance = axios.create({ baseURL })

axiosInstance.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    axiosInstance.unauthorizedNotif = false
    notification.close(global.notifKey)
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

axiosInstance.interceptors.response.use(response => {
  return response
}, async (error) => {
  const status = _get(error, 'response.status')
  const configUrl = _get(error, 'response.config.url')

  if (status === 401 && configUrl !== resource.oauthToken) {
    // logout user
  }

  if (status >= 500) {
    Sentry.captureException(error)
  }

  return Promise.reject(error)
})

export default axiosInstance