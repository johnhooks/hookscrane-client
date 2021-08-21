import type { FunctionComponent } from "react";

import { CheckCircleIcon } from "@heroicons/react/solid";

export interface Props {
  items: ItemDetail[];
}

export interface ItemDetail {
  name: string;
  label: string;
  checked: boolean;
  description?: string;
  note?: string;
}

export const InspectList: FunctionComponent<Props> = function InspectList({ items }) {
  return (
    <ul role="list" className="divide-y divide-gray-200">
      {items.map(({ name, label }) => (
        <li className="flex items-center py-4 print:py-2" key={name}>
          <CheckCircleIcon className="mr-1.5 h-5 w-5 text-green-400" />
          <span className="">{label}</span>
        </li>
      ))}
    </ul>
  );
};
