const dateRegex =
  /^(19|20)\d\d[-/.](0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])$/;
const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

import { isString } from "lodash-es";

export function isDateString(value: unknown): boolean {
  return isString(value) && dateRegex.test(value);
}

export function isTimeString(value: unknown): boolean {
  return isString(value) && timeRegex.test(value);
}

export function mapToDate({
  date,
  time,
}: {
  date: string;
  time: string;
}): Date {
  if (!isDateString(date)) throw new Error("Invalid date value");
  if (!isTimeString(time)) throw new Error("Invalid time value");

  const datetime = date + " " + time;
  const result = new Date(datetime);

  if (result instanceof Date && isNaN(result.valueOf())) {
    throw new Error(`Unable to initiate Date from value ${datetime}`);
  }

  return result;
}
