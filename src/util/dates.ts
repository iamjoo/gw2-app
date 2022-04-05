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
export function secondsToDuration(seconds: number): string {
  const numYears = Math.floor(seconds / SECONDS_IN_YEAR);
  const numDays = Math.floor(seconds % SECONDS_IN_YEAR / SECONDS_IN_DAY);
  const numHours = Math.floor(seconds % SECONDS_IN_DAY / SECONDS_IN_HOUR);
  const numMinutes =
      Math.floor(seconds % SECONDS_IN_HOUR / SECONDS_IN_MINUTE);

  let formattedAge = '';
  formattedAge += numYears > 0 ? numYears + ' years, ' : '';
  formattedAge += numDays > 0 ? numDays + ' days, ' : '';
  formattedAge += numHours + ' hours and ' + numMinutes + ' minutes';

  return formattedAge;
}

/**
 * Formats the date to 'MONTH DAY, YEAR'.
 */
export function dateStringToMediumDate(dateInput: string): string {
  const date = new Date(dateInput);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleDateString('en-US', options);
}
