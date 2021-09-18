import type { PropsWithChildren } from "react";

import type { Message } from "lib/interfaces";
import { colorClasses } from "helpers/colors";
import { statusIcons } from "helpers/icons";

interface Props {
  // onClose: () => void;
  message: Omit<Message, "body" | "key">;
}

export function Alert({ message: { heading, status }, children }: PropsWithChildren<Props>) {
  const classes = colorClasses.status[status];
  const Icon = statusIcons[status].solid;
  return (
    <div className={`rounded-md shadow-sm ${classes.background} p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${classes.icon}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${classes.heading}`}>{heading}</h3>
          <div className={`mt-2 text-sm ${classes.body}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
