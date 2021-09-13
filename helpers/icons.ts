import type { Status } from "lib/interfaces";

import {
  CheckCircleIcon as CheckCircleSolid,
  ExclamationIcon as ExclamationSolid,
  InformationCircleIcon as InformationCircleSolid,
  XCircleIcon as XCircleSolid,
} from "@heroicons/react/solid";

import {
  CheckCircleIcon as CheckCircleOutline,
  ExclamationIcon as ExclamationOutline,
  InformationCircleIcon as InformationCircleOutline,
  XCircleIcon as XCircleOutline,
} from "@heroicons/react/outline";

type IconType = "solid" | "outline";

type Icon = (props: React.ComponentProps<"svg">) => JSX.Element;

type StatusIcons = Record<Status, Record<IconType, Icon>>;

export const statusIcons: StatusIcons = {
  error: {
    solid: XCircleSolid,
    outline: XCircleOutline,
  },
  info: {
    solid: InformationCircleSolid,
    outline: InformationCircleOutline,
  },
  success: {
    solid: CheckCircleSolid,
    outline: CheckCircleOutline,
  },
  warning: {
    solid: ExclamationSolid,
    outline: ExclamationOutline,
  },
};
