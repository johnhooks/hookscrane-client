import type { PropsWithChildren } from "react";

import type { CheckboxProps } from "components/inspect-item-checkbox";

import { InspectList } from "components/inspect-list";
import { DetailList, DetailItemProps } from "components/detail-list";

export type InspectItem = Omit<CheckboxProps, "onChange">;

interface Props<Item extends InspectItem, Detail extends DetailItemProps> {
  details: Detail[];
  items: Item[];
}

export function InspectShow<Item extends InspectItem, Detail extends DetailItemProps>({
  details,
  items,
}: PropsWithChildren<Props<Item, Detail>>) {
  return (
    <article className="bg-white overflow-hidden print:text-sm sm:shadow-md sm:rounded-lg">
      <section className="px-4 sm:px-6">
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
    </article>
  );
}
