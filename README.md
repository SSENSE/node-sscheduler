# sscheduler

[![Build Status](https://travis-ci.org/SSENSE/node-sscheduler.svg?branch=master)](https://travis-ci.org/SSENSE/node-sscheduler)
[![Coverage Status](https://coveralls.io/repos/github/SSENSE/node-sscheduler/badge.svg?branch=master)](https://coveralls.io/github/SSENSE/node-sscheduler?branch=master)
[![Latest Stable Version](https://img.shields.io/npm/v/@ssense/sscheduler.svg)](https://www.npmjs.com/package/@ssense/sscheduler)
[![Known Vulnerabilities](https://snyk.io/test/npm/@ssense/sscheduler/badge.svg)](https://snyk.io/test/npm/@ssense/sscheduler)

Flexible scheduler to find free time slots in the schedule of a resource (which could be a person, a meeting room, a car, etc...)

**sscheduler** can also intersect the availability of multiple resources in order to find the time slots at which all the resources are available.

## Installation

```bash
npm install @ssense/sscheduler
```

## getAvailabilities

As an example, let's say that we want to book a 1 hour appointment with a doctor in the month of february considering that:

- We can only book on weekdays from _9AM_ to _5PM_

- We can't book between noon and _1PM_ (lunch time !)

- The doctor is on vacation the week of the _20th_

- There are already two one-hour appointments booked on _February 1st_ at _1PM_ and _2PM_

```javascript
import { getAvailabilities } from '@ssense/sscheduler'

const availability = getAvailabilities({
  from: '2017-02-01',
  to: '2017-03-01',
  timezone: 'EST',
  duration: 60,
  interval: 60,
  schedule: {
    weekdays: {
      from: '09:00',
      to: '17:00',
      unavailability: [{ from: '12:00', to: '13:00' }]
    },
    unavailability: [{ from: '2017-02-20T00:00', to: '2017-02-27T00:00' }],
    allocated: [
      { from: '2017-02-01T13:00', duration: 60 },
      { from: '2017-02-01T14:00', duration: 60 }
    ]
  }
})
```

The returned value is a structure that looks like the following:

```js
;[
  { from: '2017-02-01T09:00:00+00:00', to: '2017-02-01T10:00:00+00:00' },
  { from: '2017-02-01T10:00:00+00:00', to: '2017-02-01T11:00:00+00:00' },
  { from: '2017-02-01T11:00:00+00:00', to: '2017-02-01T12:00:00+00:00' }
  // ...
]
```

# Options

The possible options for the **getAvailability** function are:

## from (required)

```ts
type from = number
```

The start date for which we want to get availability times

## to (required)

```ts
type to = number
```

The end date for which we want to get availability times (exclusive)

## interval

```ts
type interval = number
```

_default: 0_

The interval (in minutes) of the returned availability times.
For example, a value of 15 would returns availability times such as _10:00_, _10:15_, _10:30_, _10:45_, etc..

## duration (required)

_default: 0_
The duration (in minutes) for which we need the resource.

## schedule (required)

The schedule of the resource

### Monday|Tuesday|Wednesday...|Sunday

A different schedule for each day of the week.

```ts
type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

interface DailyTimetable {
  [day in Day]?: {
    from: string // in HH:mm
    to: string // in HH:mm
    reference?: string
    unavailability?: {
      from: string // in HH:mm
      to: string // in HH:mm
    }
  }
}
```

Example:

```js
{
  Monday: {
    from: '09:00',
    to: '17:00',
    unavailability: [
      { from: '12:00', to: '13:00' }
    ]
  },
  Wednesday: {
    from: '09:00',
    to: '15:00',
  },
}
```

### weekdays

The schedule to be used for all weekdays.
The times will be in the timezone set by the `timezone` field.

```ts
interface WeeklyTimetable {
  weekdays: {
    from: string // in HH:mm
    to: string // in HH:mm
    reference?: string
    unavailability?: {
      from: string // in HH:mm
      to: string // in HH:mm
    }
  }
}
```

Example:

```js
{
  weekdays: {
    from: '09:00',
    to: '17:00',
    unavailability: [
      { from: '12:00', to: '13:00' }
    ]
  }
}
```

### availability

The availability of a specific date.

```ts
interface Schedule {
  availability: Array<{ from: string; to: string }>
}
```

Example:

```js
{
  availability: [
    { from: '2017-02-01T10:00:00+00:00', to: '2017-02-01T11:00:00+00:00' },
    { from: '2017-02-01T11:00:00+00:00', to: '2017-02-01T12:00:00+00:00' }
  ]
}
```

### unavailability

The unavailability of a specific date.

```ts
interface Schedule {
  unavailability: Array<{ from: string; to: string }>
}
```

Example:

```js
{
  unavailability: [
    { from: '2017-02-01T10:00:00+00:00', to: '2017-02-01T11:00:00+00:00' },
    { from: '2017-02-01T11:00:00+00:00', to: '2017-02-01T12:00:00+00:00' }
  ],
}
```

### allocated

Another type of unavailability, allowing to provide a duration in minutes instead of a end date.

```ts
interface Allocated {
  allocated: Array<{ from: string; duration: number }>
}
```

Example:

```js
{
  allocated: [
    { from: '2017-02-01T10:00:00+00:00', duration: 60 },
    { from: '2017-02-01T11:00:00+00:00', duration: 60 }
  ],
}
```

## timezone

```ts
type timezone = string
```

_default: 'UTC'_
The timezone that will be used when parsing all dates/times in the `schedule` field.

## normalize

```ts
type normalize = boolean
```

_default: false_
If set to true, the result will be normalized by day.

Example:

```ts
{
  '2017-02-01': [ '09:00', '10:00', '11:00', '15:00', '16:00' ],
  '2017-02-02': [ '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00' ],
  '2017-02-03': [ '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00' ],
  '2017-02-06': [ '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00' ],
  '2017-02-07': [ '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00' ]
}
```

## showUnavailable

```ts
type showUnavailable = boolean
```

_default: false_
If set to true, the result will be normalized by day and will show both unavailable and available times.

Example:

```ts
{ '2017-02-01': [ { available: false, time: '00:00' },
                  { available: false, time: '01:00' },
                  { available: true, time: '02:00' }],
  '2017-02-02': [ { available: false, time: '00:00' },
                  { available: true, time: '01:00' },
                  { available: false, time: '02:00' }]
}
```

## dateFormat

```ts
type dateFormat = string
```

_default: 'YYYY-MM-DDTHH:mm:ssZ'_
A string representing the format of the date results.
See [https://momentjs.com/docs/#/displaying/](here) for acceptable format strings.

Example:
dateFormat = 'MM-DD@hh:mm'

```ts
;[
  { from: '02-01@09:00', to: '02-01@10:00' },
  { from: '02-01@10:00', to: '02-01@11:00' },
  { from: '02-01@11:00', to: '02-01@12:00' }
]
```

## getIntersection

This function takes the same parameters as getAvailabilities except that it requires an array of schedules to intersect instead of a single schedule.

Using the same example as before, let's say that we also need to book a room for our appointment.

So, we need to intersect the doctor's availability times with the room's availability times, considering that:

- We can only book the room on weekdays from _8AM_ to _8PM_

- The room is out of service from _February 6th_ to _February 16th_

```javascript
import { getIntersection } from '@ssense/sscheduler'

const availability = getIntersection({
  from: '2017-02-01',
  to: '2017-03-01',
  duration: 60,
  interval: 60,
  schedules: [
    // The doctor's schedule
    {
      weekdays: {
        from: '09:00',
        to: '17:00',
        unavailability: [{ from: '12:00', to: '13:00' }]
      },
      unavailability: [{ from: '2017-02-20 00:00', to: '2017-02-27 00:00' }],
      allocated: [
        { from: '2017-02-01 13:00', duration: 60 },
        { from: '2017-02-01 14:00', duration: 60 }
      ]
    },

    // The room's schedule
    {
      weekdays: {
        from: '08:00',
        to: '20:00'
      },
      unavailability: [{ from: '2017-02-06 00:00', to: '2017-02-16 00:00' }]
    }
  ]
})
```

## Interval

## Authors

- **Mickael Burguet** - _Senior Developer_ - [rundef](http://rundef.com)
- **Kyle Khoury** - _Developer_

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
