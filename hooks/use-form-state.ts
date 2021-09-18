import type { Dispatch } from "react";
import { useReducer } from "react";

import type { Action, CheckboxState, InputState, Validator, State, TextInputState } from "lib/interfaces/form";

export function useFormState<Input extends InputState, Inputs extends Record<string, Input>>(initialState: {
  inputs: Inputs;
  hasSubmitted?: boolean;
}): [State<Inputs>, Dispatch<Action<Inputs>>] {
  const [state, dispatch] = useReducer(reducer, {
    inputs: initialState.inputs,
    hasSubmitted: initialState.hasSubmitted ?? false,
  });

  function reducer<FormState extends Omit<State<Inputs>, "errors">>(
    state: FormState,
    action: Action<Inputs>
  ): FormState {
    switch (action.type) {
      case "checkbox:toggle": {
        const { name } = action;
        const input = state.inputs[name];
        const value = !input.value;
        const error = input.validate(value);
        const inputs = { ...state.inputs, [name]: { ...input, value, error } };
        return { ...state, inputs };
      }
      case "submit": {
        const updates: { [key in keyof Inputs]?: Input } = {};
        for (const name of Object.keys(initialState.inputs) as Array<keyof Inputs>) {
          const input = state.inputs[name];
          const error = input.validate(input.value);
          updates[name] = { ...input, error };
        }
        const inputs = { ...state.inputs, ...updates };
        return { ...state, hasSubmitted: true, inputs };
      }
      case "input:update": {
        const { name, value } = action;
        const input = state.inputs[name];
        const error = input.validate(value);
        const inputs = { ...state.inputs, [name]: { ...input, error: error ?? null, value } };
        return { ...state, inputs };
      }
      case "input:blur": {
        const { name } = action;
        const input = state.inputs[name];
        const inputs = { ...state.inputs, [name]: { ...input, hasBlurred: true } };
        return { ...state, inputs };
      }
      default:
        return state;
    }
  }

  return [state, dispatch];
}

export function initialTextInputState(input?: {
  error?: string;
  hasBlurred?: boolean;
  value?: string;
  validate?: Validator;
}): TextInputState {
  return {
    __type: "text",
    error: input?.error ?? null,
    hasBlurred: input?.hasBlurred ?? false,
    value: input?.value ?? "",
    validate: input?.validate ?? (() => null),
  };
}

export function initialCheckboxState(input?: { value?: boolean; error?: string; validate?: Validator }): CheckboxState {
  return {
    __type: "checkbox",
    value: input?.value ?? false,
    error: input?.error ?? null,
    validate: input?.validate ?? nope,
  };
}

export function isCheckboxState(value: InputState): value is CheckboxState {
  return value.__type === "checkbox";
}

export function isTextInputState(value: InputState): value is TextInputState {
  return value.__type === "text";
}

function nope() {
  return null;
}
