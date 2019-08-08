import { Format, IntervalOptions } from '..'

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ'
const DEFAULT_TIMEZONE = 'UTC'

interface RequiredIntervalOptions {
  timezone: string
  format: Required<Format>
}

export const DEFAULT_INTERVAL_OPTIONS: RequiredIntervalOptions = Object.freeze({
  format: Object.freeze({
    date: DEFAULT_DATE_FORMAT,
    timezone: DEFAULT_TIMEZONE
  }),
  timezone: DEFAULT_TIMEZONE
})

export const setDefaultIntervalOptions = (
  overrides: IntervalOptions
): RequiredIntervalOptions =>
  overrides
    ? {
        format: {
          date:
            (overrides.format || {}).date ||
            DEFAULT_INTERVAL_OPTIONS.format.date,
          timezone:
            (overrides.format || {}).timezone ||
            DEFAULT_INTERVAL_OPTIONS.format.timezone
        },
        timezone: overrides.timezone || DEFAULT_INTERVAL_OPTIONS.timezone
      }
    : DEFAULT_INTERVAL_OPTIONS
