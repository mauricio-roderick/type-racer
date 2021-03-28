import React, { PureComponent } from 'react'
import { Table, Typography, message } from 'antd'
import { withRouter } from 'react-router-dom'
import { dateTimeFormat } from '@config/collection'
import querySting from 'query-string'
import moment from 'moment'

import { LOADING, IDLE } from '@config/constant'
import resource from '@config/resource'
import platormApiSvc from '@services/platform-api/'

export class RaceHistory extends PureComponent {
  state = {
    raceHistory: []
  }

  componentDidMount () {
    this.getRaceHistory()
  }

  componentDidUpdate (prevProps) {
    const { refresh, location: { search } } = this.props
    if (search !== prevProps.location.search || refresh !== prevProps.refresh) {
      this.getRaceHistory()
    }
  }

  async getRaceHistory () {
    let { page } = querySting.parse(this.props.location.search)
    page = isNaN(page) ? undefined : (page - 1)

    this.setState({ fetchHistoryStatus: LOADING })
    const stateUpdate = {
      fetchHistoryStatus: IDLE
    }
    try {
      const { data } = await platormApiSvc.get(resource.raceHistory, {
        params: { page }
      })
      const { totalRecords } = data.meta

      stateUpdate.raceHistory = data.raceHistory
      stateUpdate.totalRaceHistory = totalRecords
    } catch (e) {
      message.error('Failed to retrieve race history.')
    }

    this.setState(stateUpdate)
  }

  pageChangeHanlder = (page) => {
    this.props.history.replace('?page=' + page)
  }

  render () {
    const { fetchHistoryStatus, raceHistory, totalRaceHistory } = this.state
    const { page } = querySting.parse(this.props.location.search, { parseNumbers: true })

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
      hideOnSinglePage: true,
      total: totalRaceHistory,
      position: ['bottomCenter'],
      pageSize: 10,
      onChange: this.pageChangeHanlder,
      current: page
    }

    return (
      <Table
        size="small"
        columns={columns}
        pagination={pagination}
        loading={fetchHistoryStatus === LOADING}
        dataSource={raceHistory.map((item, i) => ({ ...item, key: i }))}
        title={() => <Typography.Title level={4}>Race History</Typography.Title>}
      />
    )
  }
}

export default withRouter(RaceHistory)