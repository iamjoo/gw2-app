import {Pipe, PipeTransform} from '@angular/core';

/**
 * Formats a string to a Date object.
 */
@Pipe({
  name: 'stringToDate',
  standalone: true,
})
export class StringToDate implements PipeTransform {
  transform(dateString: string): Date {
    // The full date-time string converts it to local time
    return new Date(`${dateString}T17:00`);
  }
}
