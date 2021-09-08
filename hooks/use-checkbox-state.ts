import { useState } from "react";

import type { Validator } from "helpers/validators";

interface InitialState {
  checked?: boolean;
  error?: string;
}

interface State {
  checked: boolean;
  error?: string;
}

export function useCheckboxState(initialState?: InitialState, validator?: Validator) {
  const [state, setState] = useState<State>({
    checked: initialState?.checked ?? false,
    error: initialState?.error,
  });

  function onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const checked = e.target.checked;
    let error: string | undefined = undefined;
    if (validator) error = validator(checked);
    setState({
      checked,
      error,
    });
  }

  return { ...state, onChange };
}
