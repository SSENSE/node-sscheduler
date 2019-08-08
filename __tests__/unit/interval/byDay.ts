import { byDay } from '../../../src/interval'
import '../../pretest'

const intervalConfig = {
  format: {
    date: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'UTC'
  },
  timezone: 'UTC'
}

describe('byDay', () => {
  it('Should normalize intervals', () => {
    const intervals = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T10:00:00+00:00' },
      { from: '2018-12-18T09:00:00+00:00', to: '2018-12-18T10:00:00+00:00' },
      { from: '2018-12-17T10:00:00+00:00', to: '2018-12-17T11:00:00+00:00' }
    ]

    const expected = {
      '2018-12-17': ['09:00', '10:00'],
      '2018-12-18': ['09:00']
    }

    byDay(intervals, intervalConfig).should.eql(expected)
  })

  it('Should not repeat times that are the same', () => {
    const intervals = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T10:00:00+00:00' },
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T10:00:00+00:00' },
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T10:00:00+00:00' },
      { from: '2018-12-17T10:30:00+00:00', to: '2018-12-17T12:00:00+00:00' }
    ]

    const expected = {
      '2018-12-17': ['09:00', '10:30']
    }

    byDay(intervals, intervalConfig).should.eql(expected)
  })
})
