import type { PropsWithChildren } from "react";
import Link from "next/link";
import { CalendarIcon, UserIcon } from "@heroicons/react/solid";

import { DocumentListItemFragment } from "generated/types";
import { DateFormat } from "components/date-format";

export type Props = DocumentListItemFragment;

export function ListItem({ datetime, id, pass, type }: PropsWithChildren<Props>) {
  let title: string;

  switch (type) {
    case "INSPECT_VEHICLE_DAILY":
      title = "Driver-Vehicle Inspection Report";
      break;
    case "INSPECT_CRANE_FREQUENT":
      title = "Frequent Crane Inspection";
      break;
    default:
      console.error(`Unhandled document of type: ${type}`);
      return null;
  }

  return (
    <li>
      <Link href={`/inspect/${id}`} passHref>
        <a className="block hover:bg-gray-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{title}</p>
              <div className="ml-2 flex-shrink-0 flex">
                {pass !== null && (
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
                  <DateFormat date={datetime} />
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
