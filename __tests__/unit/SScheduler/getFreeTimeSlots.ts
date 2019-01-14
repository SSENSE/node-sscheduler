import { getFreeTimeSlots } from '../../../src/sscheduler/getFreeTimeSlots'
import '../../pretest'

describe('getFreeTimeSlots', () => {
  it('Should only return availabilities that are at least min interval', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:50:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T13:30:00+00:00',
          to: '2018-12-14T16:00:00+00:00'
        },
        {
          from: '2018-12-14T16:00:00+00:00',
          to: '2018-12-14T16:20:00+00:00'
        },
        {
          from: '2018-12-14T17:00:00+00:00',
          to: '2018-12-14T17:20:00+00:00'
        },
        {
          from: '2018-12-14T18:00:00+00:00',
          to: '2018-12-14T18:30:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2017-12-10T12:50:00+00:00',
      to: '2018-12-19T12:50:00+00:00'
    }

    const expected = [
      {
        from: '2018-12-14T13:30:00+00:00',
        to: '2018-12-14T16:00:00+00:00'
      },
      {
        from: '2018-12-14T18:00:00+00:00',
        to: '2018-12-14T18:30:00+00:00'
      }
    ]

    getFreeTimeSlots(
      schedule.availability,
      schedule.unavailability,
      range,
      30,
      {}
    ).should.eql(expected)
  })

  it('Should only return availabilities that are within the range', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T18:00:00+00:00',
          to: '2018-12-14T18:30:00+00:00'
        },
        {
          from: '2018-12-14T18:30:00+00:00',
          to: '2018-12-14T19:30:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-14T18:30:00+00:00',
      to: '2018-12-14T21:30:00+00:00'
    }

    const expected = [
      {
        from: '2018-12-14T18:30:00+00:00',
        to: '2018-12-14T19:30:00+00:00'
      }
    ]

    getFreeTimeSlots(
      schedule.availability,
      schedule.unavailability,
      range,
      30,
      {}
    ).should.eql(expected)
  })

  it('Should remove unavailabilities', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T18:00:00+00:00',
          to: '2018-12-14T18:30:00+00:00'
        },
        {
          from: '2018-12-14T18:30:00+00:00',
          to: '2018-12-14T19:30:00+00:00'
        },
        {
          from: '2018-12-14T19:30:00+00:00',
          to: '2018-12-14T20:30:00+00:00'
        }
      ],
      unavailability: [
        {
          from: '2018-12-14T18:30:00+00:00',
          to: '2018-12-14T19:30:00+00:00'
        }
      ]
    }

    const range = {
      from: '2018-12-14T18:30:00+00:00',
      to: '2018-12-14T23:30:00+00:00'
    }

    const expected = [
      {
        from: '2018-12-14T19:30:00+00:00',
        to: '2018-12-14T20:30:00+00:00'
      }
    ]

    getFreeTimeSlots(
      schedule.availability,
      schedule.unavailability,
      range,
      30,
      {}
    ).should.eql(expected)
  })
})
