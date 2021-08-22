import type { PropsWithChildren } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/solid";

export interface ItemDetail {
  name: string;
  label: string;
  checked: boolean;
  description?: string;
  note?: string;
}

export interface Props<Detail extends ItemDetail> {
  items: Detail[];
}

export function InspectList<Detail extends ItemDetail>({ items }: PropsWithChildren<Props<Detail>>) {
  return (
    <ul role="list" className="divide-y divide-gray-200">
      {items.map(({ name, label, checked }) => (
        <li className="flex items-center py-4 print:py-2" key={name}>
          {checked ? (
            <CheckCircleIcon className="mx-1.5 h-5 w-5 text-green-400" />
          ) : (
            <XCircleIcon className="mx-1.5 h-5 w-5 text-red-400" />
          )}
          <span className="text-gray-900">{label}</span>
        </li>
      ))}
    </ul>
  );
}
