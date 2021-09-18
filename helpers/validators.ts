import { isDateString, isTimeString } from "lib/date";

import { Validator } from "lib/interfaces/form";

export const validateDate: Validator = function validateDate(value) {
  return isDateString(value) ? null : `${value} is an invalid date`;
};

export const validateInteger: Validator = function validateInteger(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return `${value} is an invalid integer`;
  return null;
};

export const validateTime: Validator = function validateTime(value) {
  return isTimeString(value) ? null : `${value} is an invalid time`;
};
