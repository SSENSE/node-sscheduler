import * as moment from 'moment';
import {
    AvailabilityParams,
    IntersectParams,
    Availability,
    TimeAvailability,
    Schedule, ScheduleSpecificDate, Interval
} from '../index.d';
import {cloneDeep, omit} from 'lodash';
import Moment = moment.Moment;

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

    private convertScheduleSpecificDateToInterval(schedule: ScheduleSpecificDate): Interval {
        const interval: Interval = {from: null, to: null};
        const fromDateTime = `${(<Moment> schedule.date).format('YYYY-MM-DD')} ${(<Moment> schedule.from).format('HH:mm')}`;
        const toDateTime = `${(<Moment> schedule.date).format('YYYY-MM-DD')} ${(<Moment> schedule.to).format('HH:mm')}`;
        interval.from = moment(fromDateTime, 'YYYY-MM-DD HH:mm');
        interval.to = moment(toDateTime, 'YYYY-MM-DD HH:mm');
        return interval;
    }

    protected validateAndCastScheduleSpecificDate(schedule: ScheduleSpecificDate, propertyName: string): ScheduleSpecificDate {
        const s: ScheduleSpecificDate = {
            date: moment(schedule.date, 'YYYY-MM-DD'),
            from: moment(schedule.from, 'HH:mm'),
            to: moment(schedule.to, 'HH:mm')
        };

        if (!(<Moment> s.date).isValid()) {
            throw new Error(`${propertyName} "date" must be a date in the format YYYY-MM-DD`);
        }

        if (!(<Moment> s.from).isValid()) {
            throw new Error(`${propertyName} "from" must be a time in the format HH:mm`);
        } else if (!(<Moment> s.to).isValid()) {
            throw new Error(`${propertyName} "to" must be a time in the format HH:mm`);
        } else if (!(<Moment> s.to).isAfter(s.from)) {
            throw new Error(`${propertyName} "to" must be greater than "from"`);
        }

        return s;
    }

    protected validateAndCastDaySchedule(schedule: Schedule): Schedule {
        const s: Schedule = {
            from: moment(schedule.from, 'HH:mm'),
            to: moment(schedule.to, 'HH:mm'),
            reference: schedule.reference || null
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
                    to: moment(unavailability.to, 'HH:mm'),
                    reference: unavailability.reference || null
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

    // tslint:disable-next-line:max-func-body-length
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

            for (let i = 0; i < p.schedule.unavailability.length; i += 1) {
                const unavailability = p.schedule.unavailability[i];
                let interval: Interval = {from: null, to: null};
                if ((<ScheduleSpecificDate> unavailability).date !== undefined) {
                    const s = this.validateAndCastScheduleSpecificDate(<ScheduleSpecificDate> unavailability, 'unavailability');
                    interval = this.convertScheduleSpecificDateToInterval(s);
                } else {
                    interval.from = moment(unavailability.from, 'YYYY-MM-DD HH:mm');
                    interval.to = moment(unavailability.to, 'YYYY-MM-DD HH:mm');

                    if (!interval.from.isValid()) {
                        throw new Error('unavailability "from" must be a date in the format YYYY-MM-DD HH:mm');
                    } else if (!interval.to.isValid()) {
                        throw new Error('unavailability "to" must be a date in the format YYYY-MM-DD HH:mm');
                    } else if (!interval.to.isAfter(interval.from)) {
                        throw new Error('unavailability "to" must be greater than "from"');
                    }
                }
                p.schedule.unavailability[i] = interval;
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

        if (p.schedule.custom_schedule) {
            p.schedule.custom_schedule.forEach((customSchedule, key) => {
                p.schedule.custom_schedule[key] = this.validateAndCastScheduleSpecificDate(customSchedule, 'custom_schedule');
            });
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

    public getScheduleForDay(day: moment.Moment): Schedule {
        const weekdayName: string = this.daysOfWeek[day.day()];
        const curYMD = day.format('YYYY-MM-DD');
        let customSchedule: Schedule = undefined;

        if (this.params.schedule.custom_schedule !== undefined) {
            const customScheduleForThisDay = this.params.schedule.custom_schedule.filter(
                (cs: any) => cs.date.format('YYYY-MM-DD') === curYMD
            );
            if (customScheduleForThisDay.length) {
                customSchedule = {
                    from: customScheduleForThisDay[0].from,
                    to: customScheduleForThisDay[0].to
                };
            }
        }

        if ((<any> this.params.schedule)[weekdayName] !== undefined) {
            if (customSchedule !== undefined) {
                customSchedule.unavailability = (<any> this.params.schedule)[weekdayName].unavailability || [];
                return customSchedule;
            }
            return (<any> this.params.schedule)[weekdayName];
        } else if (weekdayName !== 'saturday' && weekdayName !== 'sunday' && (<any> this.params.schedule).weekdays !== undefined) {
            if (customSchedule !== undefined) {
                customSchedule.unavailability = (<any> this.params.schedule).weekdays.unavailability || [];
                return customSchedule;
            }
            return (<any> this.params.schedule).weekdays;
        }

        return undefined;
    }

    public getAvailability(p: AvailabilityParams): Availability {
        this.validateAndCastParams(p);

        const response: Availability = {};
        const curDate = (<moment.Moment> this.params.from).clone();

        // Loop on each day from <curDate> to <toDate>
        while (curDate.isBefore(this.params.to)) {
            const daySchedule: Schedule = this.getScheduleForDay(curDate);

            // We have a schedule for this day
            if (daySchedule !== undefined) {
                const dayAvailability: TimeAvailability[] = [];

                const timeSlotStart = (<moment.Moment> daySchedule.from).clone().year(curDate.year()).dayOfYear(curDate.dayOfYear());

                // Loop from <curTime> to <endTime> in <interval> increments
                while (this.isTimeBefore(timeSlotStart, (<moment.Moment> daySchedule.to))) {
                    const timeSlotEnd = timeSlotStart.clone().add({ minutes: this.params.duration });
                    if (this.isTimeAfter(timeSlotEnd, (<moment.Moment> daySchedule.to))) {
                        dayAvailability.push({
                            time: timeSlotStart.format('HH:mm'),
                            available: false,
                            reference: daySchedule.reference
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
                        available: isAvailable,
                        reference: daySchedule.reference
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
