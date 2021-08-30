import type { PropsWithChildren, ReactElement } from "react";
import Link from "next/link";

import { DateTimeFormat } from "./date-time-format";
interface Action {
  href: string;
  label: string;
  primary?: boolean;
}

interface Props {
  actions?: Action[];
  date?: Date;
  title: string;
}

export function Page({ title, actions = [], date, children }: PropsWithChildren<Props>) {
  return (
    <>
      <header className="bg-white sm:shadow">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 print:max-w-2xl">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{title}</h2>
              {date && (
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <DateTimeFormat date={date} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              {actions.map(({ href, label, primary }, index) => (
                <Link key={href} href={href} passHref>
                  <a
                    role="button"
                    className={
                      (primary
                        ? "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 "
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 ") +
                      (index !== 0 ? "ml-3 " : "") +
                      "inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    }
                  >
                    {label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
