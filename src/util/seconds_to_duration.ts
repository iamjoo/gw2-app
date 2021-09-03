import {Pipe, PipeTransform} from '@angular/core';

import {secondsToDuration} from './dates';

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_YEAR = 365;

const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;
const SECONDS_IN_YEAR = SECONDS_IN_DAY * DAYS_IN_YEAR;

/**
 * Formats seconds to 'yy years, dd days, hh hours and mm minutes'. Omits
 * years and days if zero.
 */
@Pipe({name: 'secondsToDuration'})
export class SecondsToDuration implements PipeTransform {
  transform(seconds: number): string {
    return secondsToDuration(seconds);
  }
}
