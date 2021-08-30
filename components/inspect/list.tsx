import type { PropsWithChildren } from "react";
import Link from "next/link";
import { CalendarIcon, UserIcon } from "@heroicons/react/solid";

import { DateFormat } from "components/date-format";

interface Item {
  datetime: Date;
  href: string;
  id: number;
  pass?: boolean;
  title: string;
}

interface Props {
  inspects: Item[];
}

function ListItem({ datetime, href, pass, title }: PropsWithChildren<Item>) {
  return (
    <li>
      <Link href={href} passHref>
        <a className="block hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{title}</p>
              <div className="ml-2 flex-shrink-0 flex">
                {pass !== undefined && (
                  <p
                    className={
                      (pass ? "bg-green-100 text-green-800 " : "bg-red-100 text-red-600 ") +
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    }
                  >
                    {pass ? "Pass" : "Fail"}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <DateFormat date={new Date(datetime)} />
                </p>
                {/* extra items add a className of "mt-2" */}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                <p>John Hooks II</p>
              </div>
            </div>
          </div>
        </a>
      </Link>
    </li>
  );
}

// const href = type === "INSPECT_VEHICLE_DAILY" ? `/inspect/vehicle/${id}` : `/inspect/crane/${id}`;

export function ListInspects({ inspects }: PropsWithChildren<Props>) {
  return (
    <div className="bg-white sm:shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {inspects.map(inspect => (
          <ListItem key={inspect.id} {...inspect} />
        ))}
      </ul>
    </div>
  );
}
