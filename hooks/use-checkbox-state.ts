import type { ChangeEvent } from "react";
import { useState } from "react";

import type { Nullish } from "lib/interfaces";
import type { Validator } from "lib/interfaces/form";

interface State {
  checked: boolean;
  error: string | Nullish;
}

interface InitialState {
  checked?: boolean;
  error?: string;
}

export interface UseCheckboxState extends State {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  validate?: () => boolean;
}

export function useCheckboxState(initialState?: InitialState, validator?: Validator): UseCheckboxState {
  const [state, setState] = useState<State>({
    checked: initialState?.checked ?? false,
    error: initialState?.error ?? null,
  });

  function onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const checked = e.target.checked;
    const error = validator ? validator(checked) ?? null : null;
    setState({
      checked,
      error,
    });
  }

  function validate(): boolean {
    if (validator) {
      const error = validator(state.checked);
      if (error) {
        setState({ ...state, error });
        return false;
      }
      return true;
    }
    return true;
  }

  return { ...state, onChange, validate };
}
