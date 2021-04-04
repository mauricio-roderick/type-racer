import React, { memo } from 'react'
import { Table, Typography } from 'antd'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import _flow from 'lodash.flow'

import { LOADING } from '@config/constant'
import { dateTimeFormat } from '@config/collection'

const History = (props) => {
  const { fetchStatus, records, totalRecords, queryParams: { page } } = props

  const pageChangeHanlder = (page) => {
    props.history.replace('?page=' + page)
  }

  const columns = [{
    title: 'Text Length',
    dataIndex: 'textLength',
    align: 'center',
    width: '15%'
  }, {
    title: 'Total Time(seconds)',
    dataIndex: 'time',
    align: 'center',
    width: '15%'
  }, {
    title: 'Speed(wpm)',
    dataIndex: 'wpm',
    align: 'center',
    width: '20%'
  }, {
    title: 'Date & Time',
    dataIndex: 'timestamp',
    render: timestamp => moment(timestamp).format(dateTimeFormat.client),
    width: '30%'
  }]

  const pagination = {
    showSizeChanger: false,
    hideOnSinglePage: true,
    total: totalRecords,
    position: ['bottomCenter'],
    pageSize: 10,
    onChange: pageChangeHanlder,
    current: page
  }

  return (
    <Table
      size="small"
      columns={columns}
      pagination={pagination}
      loading={fetchStatus === LOADING}
      dataSource={records.map((item, i) => ({ ...item, key: i }))}
      title={() => <Typography.Title level={4}>Race History</Typography.Title>}
    />
  )
}

const WrappedHistory = _flow([
  withRouter,
  memo
])(History)

export default WrappedHistory