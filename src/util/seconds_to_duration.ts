import {Pipe, PipeTransform} from '@angular/core';

import {secondsToDuration, secondsToDurationShort} from './dates';

/**
 * Formats seconds to 'yy years, dd days, hh hours and mm minutes'. Omits
 * years and days if zero.
 */
@Pipe({
  name: 'secondsToDuration',
  standalone: true,
})
export class SecondsToDuration implements PipeTransform {
  transform(seconds: number): string {
    return secondsToDuration(seconds);
  }
}

/**
 * Formats seconds to 'yy years, dd days, hh hours and mm minutes'. Omits
 * years and days if zero.
 */
@Pipe({
  name: 'secondsToDurationShort',
  standalone: true,
})
export class SecondsToDurationShort implements PipeTransform {
  transform(seconds: number): string {
    return secondsToDurationShort(seconds);
  }
}
