import * as moment from 'moment-timezone'

export default (a: string, b: string) => (moment(a).isBefore(b) ? a : b)
