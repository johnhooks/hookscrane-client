import { useReducer } from "react";

import type { Message } from "lib/interfaces";

import { randomId } from "lib/utils";

interface State {
  isShowing: boolean;
  snack: Message | null;
  snackPack: Message[];
}

interface UseSnackbarInput {
  isShowing?: boolean;
  snack?: Message;
  snackPack: Message[];
}

type SnackInput = Omit<Message, "key">;

type Action = { type: "push"; payload: { snack: SnackInput } } | { type: "close" };

interface UseSnackbarState extends State {
  closeSnack: () => void;
  pushSnack: (snack: SnackInput) => void;
}

export function useSnackbarState(initialState?: UseSnackbarInput): UseSnackbarState {
  const [state, dispatch] = useReducer(reducer, {
    isShowing: initialState?.isShowing ?? false,
    snack: initialState?.snack ?? null,
    snackPack: initialState?.snackPack ?? [],
  });

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "push":
        const key = randomId() + "-" + new Date().getTime();
        const snackPack = [...state.snackPack, { ...action.payload.snack, key }];
        const snack = snackPack[0];
        return { ...state, isShowing: true, snack, snackPack: snackPack.slice(1) };
      case "close": {
        return { ...state, isShowing: false };
      }
      default:
        return state;
    }
  }

  return {
    ...state,
    closeSnack: () => dispatch({ type: "close" }),
    pushSnack: (snack: SnackInput) => dispatch({ type: "push", payload: { snack } }),
  };
}
