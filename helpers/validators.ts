import { isDateString, isTimeString } from "lib/date";

export type BaseValidator<T> = (value: T) => string | undefined;

export type Validator = BaseValidator<unknown>;
export type TextValidator = BaseValidator<string>;

export const validateDate: Validator & TextValidator = function validateDate(value: unknown) {
  return isDateString(value) ? undefined : `${value} is an invalid date`;
};

export const validateInteger: Validator & TextValidator = function validateInteger(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return `${value} is an invalid integer`;
};

export const validateTime: Validator & TextValidator = function validateTime(value) {
  return isTimeString(value) ? undefined : `${value} is an invalid time`;
};
