import type { PropsWithChildren } from "react";
import Link from "next/link";
import { CalendarIcon, UserIcon } from "@heroicons/react/solid";

import { InspectType, DailyInspect } from "generated/types";
import { DateFormat } from "components/date-format";

interface Props<Item extends DailyInspect> {
  inspects: Item[];
}

function ListItem<Item extends DailyInspect>({ id, type, hours, datetime }: PropsWithChildren<Item>) {
  return (
    <li key={id}>
      <Link href={`/inspect/${id}`} passHref>
        <a className="block hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">
                {type === InspectType.Crane ? "Crane" : "Vehicle"} Daily Inspection
              </p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Pass
                </p>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  <DateFormat date={new Date(datetime)} />
                </p>
                {/*
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                  <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  John Hooks
                </p>
                */}
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

export function DailyInspectList<Item extends DailyInspect>({ inspects }: PropsWithChildren<Props<Item>>) {
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
