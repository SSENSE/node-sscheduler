import * as moment from 'moment';
import {AvailabilityParams, IntersectParams, Availability, Schedule} from '../index.d';
import {cloneDeep, omit} from 'lodash';

export class Scheduler {
    protected params: AvailabilityParams;
    protected daysOfWeek: string[] = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
    ];

    protected validateAndCastDaySchedule(schedule: Schedule): Schedule {
        const s: Schedule = {
            from: moment(schedule.from, 'HH:mm'),
            to: moment(schedule.to, 'HH:mm')
        };

        if (!s.from.isValid()) {
            throw new Error('"from" must be a time in the format HH:mm');
        } else if (!s.to.isValid()) {
            throw new Error('"to" must be a time in the format HH:mm');
        } else if (!s.to.isAfter(s.from)) {
            throw new Error('"to" must be greater than "from"');
        }

        if (schedule.unavailability) {
            s.unavailability = [];
            for (const unavailability of schedule.unavailability) {
                const breakPeriod = {
                    from: moment(unavailability.from, 'HH:mm'),
                    to: moment(unavailability.to, 'HH:mm')
                };

                if (!breakPeriod.from.isValid()) {
                    throw new Error('unavailability "from" must be a time in the format HH:mm');
                } else if (!breakPeriod.to.isValid()) {
                    throw new Error('unavailability "to" must be a time in the format HH:mm');
                } else if (!breakPeriod.to.isAfter(breakPeriod.from)) {
                    throw new Error('unavailability "to" must be greater than "from"');
                }

                s.unavailability.push(breakPeriod);
            }
        }

        return s;
    }

    protected validateAndCastParams(params: AvailabilityParams): void {
        const p = cloneDeep(params);

        if (!p.from) {
            throw new Error('from is required');
        } else if (!p.to) {
            throw new Error('to is required');
        }

        p.from = moment(params.from, 'YYYY-MM-DD');
        p.to = moment(params.to, 'YYYY-MM-DD');

        if (!p.from.isValid()) {
            throw new Error('"from" must be a date in the format YYYY-MM-DD');
        } else if (!p.to.isValid()) {
            throw new Error('"to" must be a date in the format YYYY-MM-DD');
        } else if (!p.to.isAfter(p.from)) {
            throw new Error('"to" must be greater than "from"');
        }

        if (!p.schedule) {
            throw new Error('schedule is required');
        }

        for (const dayName of this.daysOfWeek) {
            if ((<any> p.schedule)[dayName] !== undefined) {
                try {
                    (<any> p.schedule)[dayName] = this.validateAndCastDaySchedule((<any> p.schedule)[dayName]);
                } catch (err) {
                    err.message = `${dayName}: ${err.message}`;
                    throw err;
                }
            }
        }

        if (p.schedule.weekdays) {
            try {
                p.schedule.weekdays = this.validateAndCastDaySchedule(p.schedule.weekdays);
            } catch (err) {
                err.message = `weekdays: ${err.message}`;
                throw err;
            }
        }

        if (p.schedule.unavailability) {
            for (const unavailability of p.schedule.unavailability) {
                unavailability.from = moment(unavailability.from, 'YYYY-MM-DD HH:mm');
                unavailability.to = moment(unavailability.to, 'YYYY-MM-DD HH:mm');
                if (!unavailability.from.isValid()) {
                    throw new Error('unavailability "from" must be a date in the format YYYY-MM-DD HH:mm');
                } else if (!unavailability.to.isValid()) {
                    throw new Error('unavailability "to" must be a date in the format YYYY-MM-DD HH:mm');
                } else if (!unavailability.to.isAfter(unavailability.from)) {
                    throw new Error('unavailability "to" must be greater than "from"');
                }
            }
        }

        if (isNaN(p.interval)) {
            throw new Error('"interval" must be a positive integer');
        }
        p.interval = Math.floor(p.interval);
        if (p.interval <= 0) {
            throw new Error('"interval" must be a positive integer');
        }

        if (isNaN(p.duration)) {
            throw new Error('"duration" must be a positive integer');
        }
        p.duration = Math.floor(p.duration);
        if (p.duration <= 0) {
            throw new Error('"duration" must be a positive integer');
        }

        if (p.allocated) {
            for (const allocated of p.allocated) {
                allocated.from = moment(allocated.from, 'YYYY-MM-DD HH:mm');
                if (!allocated.from.isValid()) {
                    throw new Error('"allocated.from" must be a date in the format YYYY-MM-DD HH:mm');
                }
                if (isNaN(allocated.duration)) {
                    throw new Error('"allocated.duration" must be a positive integer');
                }
                allocated.duration = Math.floor(allocated.duration);
                if (allocated.duration <= 0) {
                    throw new Error('"allocated.duration" must be a positive integer');
                }

                const allocatedMinutes = p.interval * Math.ceil(allocated.duration / p.interval);
                allocated.to = allocated.from.clone().add({ minutes: allocatedMinutes });
            }
        }

        this.params = p;
    }

    public isTimeBefore(first: moment.Moment, second: moment.Moment): boolean {
        if (first.hour() < second.hour()) {
            return true;
        } else if (first.hour() === second.hour()) {
            return first.minute() < second.minute();
        }
        return false;
    }

    public isTimeSameOrAfter(first: moment.Moment, second: moment.Moment): boolean {
        if (first.hour() > second.hour()) {
            return true;
        } else if (first.hour() === second.hour()) {
            return first.minute() >= second.minute();
        }
        return false;
    }

    public isTimeAfter(first: moment.Moment, second: moment.Moment): boolean {
        if (first.hour() > second.hour()) {
            return true;
        } else if (first.hour() === second.hour()) {
            return first.minute() > second.minute();
        }
        return false;
    }

    public isDateTimeBefore(first: moment.Moment, second: moment.Moment): boolean {
        if (first.year() < second.year()) {
            return true;
        } else if (first.year() === second.year()) {
            if (first.dayOfYear() < second.dayOfYear()) {
                return true;
            } else if (first.dayOfYear() === second.dayOfYear()) {
                return this.isTimeBefore(first, second);
            }
        }
        return false;
    }

    public isDateTimeSameOrAfter(first: moment.Moment, second: moment.Moment): boolean {
        if (first.year() > second.year()) {
            return true;
        } else if (first.year() === second.year()) {
            if (first.dayOfYear() > second.dayOfYear()) {
                return true;
            } else if (first.dayOfYear() === second.dayOfYear()) {
                return this.isTimeSameOrAfter(first, second);
            }
        }
        return false;
    }

    public isDateTimeAfter(first: moment.Moment, second: moment.Moment): boolean {
        if (first.year() > second.year()) {
            return true;
        } else if (first.year() === second.year()) {
            if (first.dayOfYear() > second.dayOfYear()) {
                return true;
            } else if (first.dayOfYear() === second.dayOfYear()) {
                return this.isTimeAfter(first, second);
            }
        }
        return false;
    }

    public isTimeslotAvailable(timeSlotStart: moment.Moment, timeSlotEnd: moment.Moment, allocateds: any[]): boolean {
        for (const allocated of allocateds) {
            if (this.isTimeSameOrAfter(timeSlotStart, allocated.from) && this.isTimeBefore(timeSlotStart, allocated.to)) {
                return false;
            } else if (this.isTimeBefore(allocated.from, timeSlotEnd) && this.isTimeAfter(allocated.to, timeSlotStart)) {
                return false;
            }
        }

        return true;
    }

    public isDateTimeslotAvailable(dateTimeSlotStart: moment.Moment, dateTimeSlotEnd: moment.Moment, allocateds: any[]): boolean {
        for (const allocated of allocateds) {
            if (this.isDateTimeSameOrAfter(dateTimeSlotStart, allocated.from) && this.isDateTimeBefore(dateTimeSlotStart, allocated.to)) {
                return false;
            } else if (this.isDateTimeBefore(allocated.from, dateTimeSlotEnd) && this.isDateTimeAfter(allocated.to, dateTimeSlotStart)) {
                return false;
            }
        }

        return true;
    }

    public getAvailability(p: AvailabilityParams): Availability {
        this.validateAndCastParams(p);

        const response: Availability = {};
        const curDate = this.params.from.clone();

        // Loop on each day from <curDate> to <toDate>
        while (curDate.isBefore(this.params.to)) {
            const dayName: string = this.daysOfWeek[curDate.day()];

            // We have a schedule for this day
            if ((<any> this.params.schedule)[dayName] !== undefined ||
                (
                    dayName !== 'saturday' && dayName !== 'sunday' &&
                    (<any> this.params.schedule).weekdays !== undefined
                )
            ) {
                const daySchedule: Schedule = (<any> this.params.schedule)[dayName] || (<any> this.params.schedule).weekdays;
                const dayAvailability: string[] = [];

                const timeSlotStart = daySchedule.from.clone().year(curDate.year()).dayOfYear(curDate.dayOfYear());

                // Loop from <curTime> to <endTime> in <interval> increments
                while (this.isTimeBefore(timeSlotStart, daySchedule.to)) {
                    const timeSlotEnd = timeSlotStart.clone().add({ minutes: this.params.duration });
                    if (this.isTimeAfter(timeSlotEnd, daySchedule.to)) {
                        break;
                    }
                    let isAvailable = true;

                    // Verify that the resource is not unavailable for the <curTime>
                    if (this.params.schedule.unavailability !== undefined) {
                        isAvailable = this.isDateTimeslotAvailable(timeSlotStart, timeSlotEnd, this.params.schedule.unavailability);
                    }

                    // Verify that the resource is not on a daily break
                    if (isAvailable && daySchedule.unavailability !== undefined) {
                        isAvailable = this.isTimeslotAvailable(timeSlotStart, timeSlotEnd, daySchedule.unavailability);
                    }

                    // Verify that the resource is not allocated for the <curTime>
                    if (isAvailable && this.params.allocated) {
                        const allocatedToday = this.params.allocated.filter((a: any) => {
                            return a.from.year() === timeSlotStart.year() &&
                                a.from.dayOfYear() === timeSlotStart.dayOfYear();
                        });
                        isAvailable = this.isTimeslotAvailable(timeSlotStart, timeSlotEnd, allocatedToday);
                    }

                    if (isAvailable) {
                        dayAvailability.push(timeSlotStart.format('HH:mm'));
                    }

                    timeSlotStart.add({ minutes: this.params.interval });
                }

                if (dayAvailability.length) {
                    response[curDate.format('YYYY-MM-DD')] = dayAvailability;
                }
            }

            curDate.add({ days: 1 });
        }

        return response;
    }

    public getIntersection(p: IntersectParams): Availability {
        const params: AvailabilityParams = <AvailabilityParams> Object.assign(
            { schedule: null },
            cloneDeep(omit(p, ['schedules']))
        );
        const availabilities: Availability[] = [];
        for (const schedule of p.schedules) {
            params.schedule = schedule;
            availabilities.push(this.getAvailability(params));
        }

        if (availabilities.length === 0) {
            return {};
        } else if (availabilities.length === 1) {
            return availabilities[0];
        }

        const daysIntersection = Object.keys(availabilities[0]).filter((day: string) => {
            for (let i = 1; i < availabilities.length; i = i + 1) {
                if (!availabilities[i].hasOwnProperty(day)) {
                    return false;
                }
            }
            return true;
        });

        const response: Availability = {};
        for (const day of daysIntersection) {
            const dayTimesIntersection = availabilities[0][day].filter((time: string) => {
                for (let i = 1; i < availabilities.length; i = i + 1) {
                    if (availabilities[i][day].indexOf(time) === -1) {
                        return false;
                    }
                }
                return true;
            });

            if (dayTimesIntersection.length > 0) {
                response[day] = dayTimesIntersection;
            }
        }

        return response;
    }
}
