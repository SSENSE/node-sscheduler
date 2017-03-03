import {expect} from 'chai';
import {Scheduler} from '../../src/index';
import {TimeAvailability} from '../../index.d';
import * as fs from 'fs';
import * as path from 'path';
import {clone} from 'lodash';
import * as moment from 'moment';

const scheduler = new Scheduler();

const fileExists = (p: string): boolean => {
    try {
        return fs.lstatSync(p).isFile();
    } catch (err) {
        return false;
    }
};

const getAvailabilitiesAsStrings = (response: any): any => {
    const availabilities: any = {};
    for (const day of Object.keys(response)) {
        const tmp: string[] = response[day].filter((el: TimeAvailability) => el.available)
            .map((el: TimeAvailability) => el.time);
        if (tmp.length) {
            availabilities[day] = tmp;
        }
    }
    return availabilities;
};

const runTest = (inputFilename: string, expectedFilename: string): void => {
    const input = JSON.parse(fs.readFileSync(inputFilename).toString());
    const expected = JSON.parse(fs.readFileSync(expectedFilename).toString());

    const response = scheduler.getAvailability(input);
    expect(getAvailabilitiesAsStrings(response)).to.deep.equal(expected);
};

const runTestIntersect = (inputFilename: string, expectedFilename: string): void => {
    const input = JSON.parse(fs.readFileSync(inputFilename).toString());
    const expected = JSON.parse(fs.readFileSync(expectedFilename).toString());

    const response = scheduler.getIntersection(input);
    expect(getAvailabilitiesAsStrings(response)).to.deep.equal(expected);
};

describe('getAvailability', () => {
    describe('validation', () => {
        it('from/to validation', () => {
            expect(scheduler.getAvailability.bind(scheduler, {
                from: 'test',
                to: '2017-01-24',
                schedule: {},
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, '"from" must be a date in the format YYYY-MM-DD');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: 'test',
                schedule: {},
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, '"to" must be a date in the format YYYY-MM-DD');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-23',
                schedule: {},
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, '"to" must be greater than "from"');
        });

        it('schedule validation', () => {
            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: 'test',
                        to: '10:00'
                    }
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'monday: "from" must be a time in the format HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: 'test'
                    }
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'monday: "to" must be a time in the format HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: '09:00'
                    }
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'monday: "to" must be greater than "from"');
        });

        it('schedule unavailability validation Interval type', () => {
            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: '17:00',
                        unavailability: [{
                            from: 'test',
                            to: '13:00'
                        }]
                    }
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'monday: unavailability "from" must be a time in the format HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: '17:00',
                        unavailability: [{
                            from: '12:00',
                            to: 'test'
                        }]
                    }
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'monday: unavailability "to" must be a time in the format HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: '17:00',
                        unavailability: [{
                            from: '12:00',
                            to: '12:00'
                        }]
                    }
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'monday: unavailability "to" must be greater than "from"');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    unavailability: [{
                        from: 'test',
                        to: '2017-01-23 13:00'
                    }]
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'unavailability "from" must be a date in the format YYYY-MM-DD HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    unavailability: [{
                        from: '2017-01-23 10:00',
                        to: 'test'
                    }]
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'unavailability "to" must be a date in the format YYYY-MM-DD HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    unavailability: [{
                        from: '2017-01-23 10:00',
                        to: '2017-01-23 09:00'
                    }]
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, 'unavailability "to" must be greater than "from"');
        });

        it('schedule unavailability validation ScheduleSpecificDate type', () => {
            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: '17:00',
                        unavailability: [{
                            from: 'test',
                            to: '13:00'
                        }]
                    }
                },
                interval: 30,
                duration: 30
            }))
                .to.throw(Error, 'monday: unavailability "from" must be a time in the format HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: '17:00',
                        unavailability: [{
                            from: '12:00',
                            to: 'test'
                        }]
                    }
                },
                interval: 30,
                duration: 30
            }))
                .to.throw(Error, 'monday: unavailability "to" must be a time in the format HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: {
                        from: '09:00',
                        to: '17:00',
                        unavailability: [{
                            from: '12:00',
                            to: '12:00'
                        }]
                    }
                },
                interval: 30,
                duration: 30
            }))
                .to.throw(Error, 'monday: unavailability "to" must be greater than "from"');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    unavailability: [{
                        date: 'test',
                        from: '12:00',
                        to: '13:00'
                    }]
                },
                interval: 30,
                duration: 30
            }))
                .to.throw(Error, 'unavailability "date" must be a date in the format YYYY-MM-DD');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    unavailability: [{
                        date: '2017-01-23',
                        from: 'test',
                        to: '13:00'
                    }]
                },
                interval: 30,
                duration: 30
            }))
                .to.throw(Error, 'unavailability "from" must be a time in the format HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    unavailability: [{
                        date: '2017-01-23',
                        from: '10:00',
                        to: 'test'
                    }]
                },
                interval: 30,
                duration: 30
            }))
                .to.throw(Error, 'unavailability "to" must be a time in the format HH:mm');
        });

        it('schedule allocated validation', () => {
            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: { from: '09:00', to: '17:00' },
                    allocated: [
                        { from: 'test', duration: 60 }
                    ]
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, '"allocated.from" must be a date in the format YYYY-MM-DD HH:mm');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: { from: '09:00', to: '17:00' },
                    allocated: [
                        { from: '2017-01-23 10:00', duration: -1 }
                    ]
                },
                interval: 30,
                duration: 30
            }))
            .to.throw(Error, '"allocated.duration" must be a positive integer');
        });

        it('interval validation', () => {
            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: { from: '09:00', to: '17:00' }
                },
                interval: 'test',
                duration: 30
            }))
            .to.throw(Error, '"interval" must be a positive integer');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: { from: '09:00', to: '17:00' }
                },
                interval: -5,
                duration: 30
            }))
            .to.throw(Error, '"interval" must be a positive integer');
        });

        it('duration validation', () => {
            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: { from: '09:00', to: '17:00' }
                },
                interval: 30,
                duration: 'test'
            }))
            .to.throw(Error, '"duration" must be a positive integer');

            expect(scheduler.getAvailability.bind(scheduler, {
                from: '2017-01-23',
                to: '2017-01-24',
                schedule: {
                    monday: { from: '09:00', to: '17:00' }
                },
                interval: 30,
                duration: -5
            }))
            .to.throw(Error, '"duration" must be a positive integer');
        });
    });

    describe('helper functions', () => {
        it('isTimeBefore', () => {
            let first = moment('11:00', 'HH:mm');
            let second = moment('11:30', 'HH:mm');
            expect(scheduler.isTimeBefore(first, second)).to.equal(true);
            expect(scheduler.isTimeBefore(second, first)).to.equal(false);
            expect(scheduler.isTimeBefore(first, first)).to.equal(false);

            // this function should only compare times and not dates
            first = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            second = moment('2017-01-27 11:30', 'YYYY-MM-DD HH:mm');
            expect(scheduler.isTimeBefore(first, second)).to.equal(true);
            expect(scheduler.isTimeBefore(second, first)).to.equal(false);
        });

        it('isTimeAfter', () => {
            let first = moment('11:30', 'HH:mm');
            let second = moment('11:00', 'HH:mm');
            expect(scheduler.isTimeAfter(first, second)).to.equal(true);
            expect(scheduler.isTimeAfter(second, first)).to.equal(false);
            expect(scheduler.isTimeAfter(first, first)).to.equal(false);

            // this function should only compare times and not dates
            first = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            second = moment('2017-01-27 11:00', 'YYYY-MM-DD HH:mm');
            expect(scheduler.isTimeAfter(first, second)).to.equal(true);
            expect(scheduler.isTimeAfter(second, first)).to.equal(false);
        });

        it('isTimeSameOrAfter', () => {
            let first = moment('11:30', 'HH:mm');
            let second = moment('11:00', 'HH:mm');
            expect(scheduler.isTimeSameOrAfter(first, second)).to.equal(true);
            expect(scheduler.isTimeSameOrAfter(second, first)).to.equal(false);
            expect(scheduler.isTimeSameOrAfter(first, first)).to.equal(true);

            // this function should only compare times and not dates
            first = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            second = moment('2017-01-27 11:00', 'YYYY-MM-DD HH:mm');
            expect(scheduler.isTimeSameOrAfter(first, second)).to.equal(true);
            expect(scheduler.isTimeSameOrAfter(second, first)).to.equal(false);
            expect(scheduler.isTimeSameOrAfter(second, second)).to.equal(true);
        });

        it('isDateTimeBefore', () => {
            let first = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            let second = moment('2017-01-24 11:30', 'YYYY-MM-DD HH:mm');
            expect(scheduler.isDateTimeBefore(first, second)).to.equal(true);
            expect(scheduler.isDateTimeBefore(second, first)).to.equal(false);
            expect(scheduler.isDateTimeBefore(first, first)).to.equal(false);

            first = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            second = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            expect(scheduler.isDateTimeBefore(first, second)).to.equal(true);
            expect(scheduler.isDateTimeBefore(second, first)).to.equal(false);
            expect(scheduler.isDateTimeBefore(first, first)).to.equal(false);
        });

        it('isDateTimeAfter', () => {
            let first = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            let second = moment('2017-01-24 11:00', 'YYYY-MM-DD HH:mm');
            expect(scheduler.isDateTimeAfter(first, second)).to.equal(false);
            expect(scheduler.isDateTimeAfter(second, first)).to.equal(true);
            expect(scheduler.isDateTimeAfter(first, first)).to.equal(false);

            first = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            second = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            expect(scheduler.isDateTimeAfter(first, second)).to.equal(true);
            expect(scheduler.isDateTimeAfter(second, first)).to.equal(false);
            expect(scheduler.isDateTimeAfter(first, first)).to.equal(false);
        });

        it('isTimeslotAvailable', () => {
            let start = moment('11:00', 'HH:mm');
            let end = moment('11:30', 'HH:mm');
            let allocated = [
                { from: moment('11:00', 'HH:mm'), to: moment('11:45', 'HH:mm') }
            ];
            expect(scheduler.isTimeslotAvailable(start, end, allocated)).to.equal(false);

            start = moment('11:00', 'HH:mm');
            end = moment('11:30', 'HH:mm');
            allocated = [
                { from: moment('11:15', 'HH:mm'), to: moment('11:30', 'HH:mm') }
            ];
            expect(scheduler.isTimeslotAvailable(start, end, allocated)).to.equal(false);

            start = moment('11:00', 'HH:mm');
            end = moment('11:30', 'HH:mm');
            allocated = [
                { from: moment('11:30', 'HH:mm'), to: moment('11:45', 'HH:mm') }
            ];
            expect(scheduler.isTimeslotAvailable(start, end, allocated)).to.equal(true);

            start = moment('11:30', 'HH:mm');
            end = moment('12:00', 'HH:mm');
            allocated = [
                { from: moment('11:15', 'HH:mm'), to: moment('11:30', 'HH:mm') }
            ];
            expect(scheduler.isTimeslotAvailable(start, end, allocated)).to.equal(true);

            start = moment('13:45', 'HH:mm');
            end = moment('14:15', 'HH:mm');
            allocated = [
                { from: moment('13:15', 'HH:mm'), to: moment('13:45', 'HH:mm') }
            ];
            expect(scheduler.isTimeslotAvailable(start, end, allocated)).to.equal(true);

            // this function should only compare times and not dates
            start = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            end = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            allocated = [
                { from: moment('2017-01-27 11:15', 'YYYY-MM-DD HH:mm'), to: moment('2017-01-27 11:30', 'YYYY-MM-DD HH:mm') }
            ];
            expect(scheduler.isTimeslotAvailable(start, end, allocated)).to.equal(false);
        });

        it('isDateTimeslotAvailable', () => {
            let start = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            let end = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            let allocated = [
                { from: moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm'), to: moment('2017-01-23 11:45', 'YYYY-MM-DD HH:mm') }
            ];
            expect(scheduler.isDateTimeslotAvailable(start, end, allocated)).to.equal(false);

            start = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            end = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            allocated = [
                { from: moment('2017-01-23 11:15', 'YYYY-MM-DD HH:mm'), to: moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm') }
            ];
            expect(scheduler.isDateTimeslotAvailable(start, end, allocated)).to.equal(false);

            start = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            end = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            allocated = [
                { from: moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm'), to: moment('2017-01-23 11:45', 'YYYY-MM-DD HH:mm') }
            ];
            expect(scheduler.isDateTimeslotAvailable(start, end, allocated)).to.equal(true);

            start = moment('2017-01-23 11:00', 'YYYY-MM-DD HH:mm');
            end = moment('2017-01-23 11:30', 'YYYY-MM-DD HH:mm');
            allocated = [
                { from: moment('2017-01-24 11:00', 'YYYY-MM-DD HH:mm'), to: moment('2017-01-24 11:45', 'YYYY-MM-DD HH:mm') }
            ];
            expect(scheduler.isDateTimeslotAvailable(start, end, allocated)).to.equal(true);

            start = moment('2017-01-27 15:30', 'YYYY-MM-DD HH:mm');
            end = moment('2017-01-27 16:00', 'YYYY-MM-DD HH:mm');
            allocated = [
                { from: moment('2017-01-24 11:00', 'YYYY-MM-DD HH:mm'), to: moment('2017-01-26 11:00', 'YYYY-MM-DD HH:mm') },
                { from: moment('2017-01-27 13:00', 'YYYY-MM-DD HH:mm'), to: moment('2017-01-27 16:00', 'YYYY-MM-DD HH:mm') }
            ];
            expect(scheduler.isDateTimeslotAvailable(start, end, allocated)).to.equal(false);
        });
    });

    describe('functionality', () => {
        const dataPath = path.resolve(__dirname, 'data');
        const folders = fs.readdirSync(dataPath);
        for (const folder of folders) {
            describe(folder, () => {
                const subFolders = fs.readdirSync(path.resolve(dataPath, folder));
                for (const subFolder of subFolders) {
                    for (let i = 1; i < 100; i = i + 1) {
                        const no = (i >= 10 ? `${i}` : `0${i}`);
                        if (fileExists(path.resolve(dataPath, folder, subFolder, `input${no}.json`))) {
                            it(`${subFolder}: test #${no}`, () => {
                                if (folder === '03-intersect') {
                                    runTestIntersect(
                                        path.resolve(dataPath, folder, subFolder, `input${no}.json`),
                                        path.resolve(dataPath, folder, subFolder, `expected${no}.json`)
                                    );
                                } else {
                                    runTest(
                                        path.resolve(dataPath, folder, subFolder, `input${no}.json`),
                                        path.resolve(dataPath, folder, subFolder, `expected${no}.json`)
                                    );
                                }
                            });
                        } else {
                            break;
                        }
                    }
                }
            });
        }
    });
});
