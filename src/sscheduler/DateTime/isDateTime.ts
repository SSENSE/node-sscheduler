import { DateTime } from '.'

export default (something: any): something is DateTime => !!something.date
