import type { ChangeEvent, FocusEvent } from "react";
import { useReducer } from "react";

import type { Nullish } from "lib/interfaces";
import type { TextValidator } from "helpers/validators";

interface State {
  hasBlurred: boolean;
  error?: string | Nullish;
  value: string;
}

type InitialState = Omit<State, "hasBlurred"> & { hasBlurred?: boolean };

type Action =
  | { type: "change"; payload: { value: string; error: string | null } }
  | { type: "blur" }
  | { type: "error"; payload: { error: string | null } };

export interface UseTextInputState extends State {
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  validate: () => boolean;
}

export function useTextInputState(initialState: InitialState, validator: TextValidator): UseTextInputState {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    error: initialState.error ?? null,
    hasBlurred: initialState.hasBlurred ?? false,
  });

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "blur":
        return { ...state, hasBlurred: true };
      case "change": {
        const { value, error } = action.payload;
        return { ...state, value, error: error ?? null };
      }
      case "error": {
        const { error } = action.payload;
        return { ...state, error: error ?? null };
      }
      default:
        return state;
    }
  }

  function onBlur(): void {
    dispatch({ type: "blur" });
  }

  function onChange(e: ChangeEvent<HTMLInputElement>): void {
    e.preventDefault();
    const value = e.target.value;
    const error = validator(value);
    dispatch({ type: "change", payload: { value, error: error ?? null } });
  }

  function validate(): boolean {
    const error = validator(state.value) ?? null;
    if (error !== state.error) dispatch({ type: "error", payload: { error } });
    return error === null;
  }

  return {
    ...state,
    onBlur,
    onChange,
    validate,
  };
}
