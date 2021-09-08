import type { ChangeEvent } from "react";
import { useReducer } from "react";

import type { TextValidator } from "helpers/validators";

interface State {
  showErrors?: boolean; // has blurred
  error?: string;
  value: string;
}

type Action = { type: "change"; payload: { value: string; error?: string } } | { type: "blur" };

export function useTextInputState(initialState: State, validator: TextValidator) {
  const [state, dispatch] = useReducer(reducer, initialState);

  function onBlur(): void {
    dispatch({ type: "blur" });
  }

  function onChange(e: ChangeEvent<HTMLInputElement>): void {
    e.preventDefault();
    const value = e.target.value;
    const error = validator(value);
    dispatch({ type: "change", payload: { value, error } });
  }

  return { ...state, onBlur, onChange };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "blur":
      return { ...state, showErrors: true };
    case "change": {
      const { value, error } = action.payload;
      return { ...state, value, error };
    }
    default:
      return state;
  }
}
