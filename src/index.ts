import {
  getIntersection,
  SScheduleIntersectionParams,
  SSchedulerParams
} from './sscheduler'
import getAvailabilities from './sscheduler/getAvailabilities'

// this class is for backwards compatibility with v1
// v2 only uses functions and not classes
export class Scheduler {
  public getAvailability(params: SSchedulerParams) {
    return getAvailabilities({
      normalize: true,
      showUnavailable: true,
      ...params
    })
  }

  public getIntersection(params: SScheduleIntersectionParams) {
    return getIntersection({
      normalize: true,
      ...params
    })
  }
}

export { getAvailabilities }
