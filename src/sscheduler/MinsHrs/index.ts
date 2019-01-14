export interface MinsHrs {
  from: {
    hour: number
    minute: number
  }
  to: {
    hour: number
    minute: number
  }
}

export type ScheduleMinsHrs = MinsHrs & {
  unavailability: MinsHrs[]
}

export interface DailyScheduleMinsHrs {
  [k: number]: ScheduleMinsHrs
}

export { default as intervalToMinsHrs } from './fromInterval'
