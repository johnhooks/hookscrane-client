import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { Message } from "lib/interfaces";
import { Snack } from "components/notification/snack";

import { useSnackbarState } from "hooks/use-snackbar-state";

type PushSnackInput = Omit<Message, "key">;

interface Context {
  pushSnack: (input: PushSnackInput) => void;
}

// https://fettblog.eu/typescript-react/context/
const SnackbarContext = createContext<Context>({} as Context);

export const useSnackbar = (): Context => useContext(SnackbarContext);

export function SnackbarProvider({ children }: PropsWithChildren<{}>) {
  const { closeSnack, isShowing, pushSnack, snack } = useSnackbarState();

  return (
    <SnackbarContext.Provider value={{ pushSnack }}>
      {children}
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 lg:px-8 lg:py-10"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-start">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          {snack && <Snack message={snack} isShowing={isShowing} onClose={closeSnack}></Snack>}
        </div>
      </div>
    </SnackbarContext.Provider>
  );
}
