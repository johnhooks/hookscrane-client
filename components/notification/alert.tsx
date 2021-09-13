import type { PropsWithChildren } from "react";
import { CheckCircleIcon, ExclamationIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/solid";

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
    <div className={`rounded-md ${classes.background} p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${classes.icon}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${classes.heading}`}>{heading}</h3>
          <div className={`mt-2 text-sm ${classes.body}`}>
            {children}
            {/* <ul role="list" className="list-disc pl-5 space-y-1">
              <li>Your password must be at least 8 characters</li>
              <li>Your password must include at least one pro wrestling finishing move</li>
            </ul> */}
          </div>
        </div>
      </div>
    </div>
  );
}
