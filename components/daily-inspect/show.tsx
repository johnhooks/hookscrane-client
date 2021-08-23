import type { PropsWithChildren } from "react";

import type { CheckboxProps } from "components/inspect-item-checkbox";

import { InspectList } from "components/inspect-list";
import { DetailList, DetailItemProps } from "components/detail-list";
import { DateFormat } from "components/date-format";
import { TimeFormat } from "components/time-format";

export type InspectItem = Omit<CheckboxProps, "onChange">;

interface Props<Item extends InspectItem, Detail extends DetailItemProps> {
  title: string;
  datetime: Date;
  details: Detail[];
  items: Item[];
}

export function DailyInspectShow<Item extends InspectItem, Detail extends DetailItemProps>({
  title,
  datetime,
  details,
  items,
}: PropsWithChildren<Props<Item, Detail>>) {
  return (
    <article className="py-16 overflow-hidden lg:py-24 print:text-sm">
      <div className="max-w-2xl mx-auto">
        <header className="text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-4 sm:text-xl text-gray-500">
            <span>
              <DateFormat date={datetime} />
            </span>
            <span className="ml-4">
              <TimeFormat date={datetime} />
            </span>
          </p>
        </header>
        <div className="bg-white mt-4 sm:mt-8 sm:rounded-lg">
          <section className="px-4 py-4 sm:px-6 lg:py-6 lg:px-8">
            <header className="text-center mt-2 sm:mt-4">
              <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">Details</h3>
            </header>
            <DetailList items={details} className="mt-4" />
          </section>
          <section className="mt-4 sm:mt-8">
            <header className="text-center">
              <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">Criteria</h3>
            </header>
            <InspectList items={items} />
          </section>
        </div>
      </div>
    </article>
  );
}
