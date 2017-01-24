import * as moment from 'moment';
import {
    AvailabilityParams,
    IntersectParams,
    Availability,
    TimeAvailability,
    Schedule
} from '../index.d';
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

        if (! (<moment.Moment> s.from).isValid()) {
            throw new Error('"from" must be a time in the format HH:mm');
        } else if (! (<moment.Moment> s.to).isValid()) {
            throw new Error('"to" must be a time in the format HH:mm');
        } else if (! (<moment.Moment> s.to).isAfter(s.from)) {
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

        if (p.schedule.allocated) {
            for (const allocated of p.schedule.allocated) {
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
        const curDate = (<moment.Moment> this.params.from).clone();

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
                const dayAvailability: TimeAvailability[] = [];

                const timeSlotStart = (<moment.Moment> daySchedule.from).clone().year(curDate.year()).dayOfYear(curDate.dayOfYear());

                // Loop from <curTime> to <endTime> in <interval> increments
                while (this.isTimeBefore(timeSlotStart, (<moment.Moment> daySchedule.to))) {
                    const timeSlotEnd = timeSlotStart.clone().add({ minutes: this.params.duration });
                    if (this.isTimeAfter(timeSlotEnd, (<moment.Moment> daySchedule.to))) {
                        dayAvailability.push({
                            time: timeSlotStart.format('HH:mm'),
                            available: false
                        });
                        timeSlotStart.add({ minutes: this.params.interval });
                        continue;
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
                    if (isAvailable && this.params.schedule.allocated) {
                        const allocatedToday = this.params.schedule.allocated.filter((a: any) => {
                            return a.from.year() === timeSlotStart.year() &&
                                a.from.dayOfYear() === timeSlotStart.dayOfYear();
                        });
                        isAvailable = this.isTimeslotAvailable(timeSlotStart, timeSlotEnd, allocatedToday);
                    }

                    dayAvailability.push({
                        time: timeSlotStart.format('HH:mm'),
                        available: isAvailable
                    });

                    timeSlotStart.add({ minutes: this.params.interval });
                }

                response[curDate.format('YYYY-MM-DD')] = dayAvailability;
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

        for (const day of Object.keys(availabilities[0])) {
            availabilities[0][day] = availabilities[0][day].map((timeAv: TimeAvailability, idx: number) => {
                if (timeAv.available) {
                    timeAv.available = availabilities.length === availabilities.filter((days: any) => {
                        if (days[day] === undefined) {
                            return false;
                        }

                        return 1 === days[day].filter((time: TimeAvailability) => {
                            return timeAv.time === time.time && time.available;
                        }).length;
                    }).length;
                }
                return timeAv;
            });
        }

        return availabilities[0];
    }
}
