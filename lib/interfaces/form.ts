import type { ChangeEvent, HTMLProps } from "react";
import type { Nullish } from "./index";

export type Validator = (value: unknown) => string | null;

type InputType = "text" | "checkbox";

export type InputErrors<Inputs extends Record<string, unknown>, K = keyof Inputs> = Iterator<{
  name: K;
  error: string;
}>;

export interface BaseInputState<Value> {
  __type: InputType;
  error?: string | Nullish;
  validate: Validator;
  value: Value;
}

export interface InputProps extends HTMLProps<HTMLInputElement> {
  description?: string | undefined;
  id: string;
  label: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showErrors?: boolean;
}

export interface TextInputState extends BaseInputState<string> {
  __type: "text";
  hasBlurred: boolean;
}

export interface CheckboxState extends BaseInputState<boolean> {
  __type: "checkbox";
}

export type InputState = CheckboxState | TextInputState;

export type Action<Inputs extends Record<string, unknown>, K = keyof Inputs> =
  | { type: "checkbox:toggle"; name: K; error?: string }
  | { type: "submit" }
  | { type: "input:update"; value: string; name: K; error?: string }
  | { type: "input:blur"; name: K };

export type State<Inputs extends Record<string, InputState>> = {
  inputs: Inputs;
  hasSubmitted: boolean;
};
