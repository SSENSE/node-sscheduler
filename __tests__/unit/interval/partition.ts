import { Interval, partition } from '../../../src/interval'
import '../../pretest'

const intervalConfig = {
  format: {
    date: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'UTC'
  },
  timezone: 'UTC'
}

const boundPartition = (a: Interval | Interval[], b: number, c: number) =>
  partition(a, b, c, intervalConfig)

describe('partition', () => {
  it('Should break up a single interval with 0 duration when it partitions perfectly', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T13:00:00+00:00'
    }
    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T12:00:00+00:00'
      },
      {
        from: '2018-12-14T12:15:00+00:00',
        to: '2018-12-14T12:15:00+00:00'
      },
      {
        from: '2018-12-14T12:30:00+00:00',
        to: '2018-12-14T12:30:00+00:00'
      },
      {
        from: '2018-12-14T12:45:00+00:00',
        to: '2018-12-14T12:45:00+00:00'
      }
    ]

    boundPartition(interval, 15, 0).should.eql(expected)
  })

  it("Should break up a single interval with 0 duration when it doesn't boundPartition perfectly", () => {
    const interval = {
      from: '2018-12-14T12:05:00+00:00',
      to: '2018-12-14T13:00:00+00:00'
    }
    const expected = [
      {
        from: '2018-12-14T12:15:00+00:00',
        to: '2018-12-14T12:15:00+00:00'
      },
      {
        from: '2018-12-14T12:30:00+00:00',
        to: '2018-12-14T12:30:00+00:00'
      },
      {
        from: '2018-12-14T12:45:00+00:00',
        to: '2018-12-14T12:45:00+00:00'
      }
    ]

    boundPartition(interval, 15, 0).should.eql(expected)
  })

  it('Should break up a single interval with duration when it partitions perfectly and ignores intervals outside of duration', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T13:00:00+00:00'
    }
    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T12:40:00+00:00'
      },
      {
        from: '2018-12-14T12:15:00+00:00',
        to: '2018-12-14T12:55:00+00:00'
      }
    ]

    boundPartition(interval, 15, 40).should.eql(expected)
  })

  it("Should break up a single interval with duration when it doesn't boundPartition perfectly and ignore intervals outside of duration", () => {
    const interval = {
      from: '2018-12-14T12:05:00+00:00',
      to: '2018-12-14T13:44:00+00:00'
    }
    const expected = [
      {
        from: '2018-12-14T12:15:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T12:30:00+00:00',
        to: '2018-12-14T13:15:00+00:00'
      },
      {
        from: '2018-12-14T12:45:00+00:00',
        to: '2018-12-14T13:30:00+00:00'
      }
    ]

    boundPartition(interval, 15, 45).should.eql(expected)
  })

  it('Should only start at the interval slice times', () => {
    const interval = {
      from: '2018-12-14T12:05:00+00:00',
      to: '2018-12-14T12:58:00+00:00'
    }
    const expected = [
      {
        from: '2018-12-14T12:15:00+00:00',
        to: '2018-12-14T12:30:00+00:00'
      },
      {
        from: '2018-12-14T12:30:00+00:00',
        to: '2018-12-14T12:45:00+00:00'
      }
    ]

    boundPartition(interval, 15, 15).should.eql(expected)
  })

  it('Should only start at the interval slice times when wrapping around hours', () => {
    const interval = {
      from: '2018-12-14T12:05:00+00:00',
      to: '2018-12-14T14:29:00+00:00'
    }
    const expected = [
      {
        from: '2018-12-14T12:30:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T13:30:00+00:00'
      },
      {
        from: '2018-12-14T13:30:00+00:00',
        to: '2018-12-14T14:00:00+00:00'
      }
    ]

    boundPartition(interval, 30, 30).should.eql(expected)
  })

  it('Should break up multiple intervals', () => {
    const interval = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T16:25:00+00:00',
        to: '2018-12-14T17:00:00+00:00'
      }
    ]
    const expected: any = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T12:15:00+00:00'
      },
      {
        from: '2018-12-14T12:15:00+00:00',
        to: '2018-12-14T12:30:00+00:00'
      },
      {
        from: '2018-12-14T12:30:00+00:00',
        to: '2018-12-14T12:45:00+00:00'
      },
      {
        from: '2018-12-14T12:45:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T16:30:00+00:00',
        to: '2018-12-14T16:45:00+00:00'
      },
      {
        from: '2018-12-14T16:45:00+00:00',
        to: '2018-12-14T17:00:00+00:00'
      }
    ]

    boundPartition(interval, 15, 15).should.eql(expected)
  })

  it('Should always keep the references', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      reference: 'A',
      to: '2018-12-14T13:00:00+00:00'
    }

    boundPartition(interval, 15, 40).should.each.have.property(
      'reference',
      interval.reference
    )
  })
})
