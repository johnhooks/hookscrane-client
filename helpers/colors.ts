import type { Status } from "lib/interfaces";

export interface StatusColorClasses {
  readonly background: string;
  readonly body: string;
  readonly heading: string;
  readonly icon: string;
}

interface ColorClasses {
  status: Record<Status, StatusColorClasses>;
}

export const colorClasses: ColorClasses = {
  status: {
    error: {
      background: "bg-red-50",
      body: "text-red-700",
      heading: "text-red-800",
      icon: "text-red-400",
    },
    info: {
      background: "bg-blue-50",
      body: "text-blue-700",
      heading: "text-blue-800",
      icon: "text-blue-400",
    },
    success: {
      background: "bg-green-50",
      body: "text-green-700",
      heading: "text-green-800",
      icon: "text-green-400",
    },
    warning: {
      background: "bg-yellow-50",
      body: "text-yellow-700",
      heading: "text-yellow-800",
      icon: "text-yellow-400",
    },
  },
};
