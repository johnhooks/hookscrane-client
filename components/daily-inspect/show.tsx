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
    <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24 print:text-sm">
        <div className="max-w-xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 sm:text-xl text-gray-500">
              <span>
                <DateFormat date={datetime} />
              </span>
              <span className="ml-4">
                <TimeFormat date={datetime} />
              </span>
            </p>
          </div>
          <div className="mt-4">
            <div>
              <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Details
              </h3>
            </div>
            <DetailList items={details} className="mt-4" />
            <div className="mt-8">
              <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Criteria
              </h3>
              <div className="mt-4">
                <InspectList items={items} />
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
