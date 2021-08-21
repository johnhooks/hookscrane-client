import type { FunctionComponent } from "react";

import { InspectItemCheckbox } from "./inspect-item-checkbox";

export interface InspectItem {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  description?: string;
  note?: string;
}

export interface Props {
  name: string;
  items: InspectItem[];
  handleToggle: (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InspectChecklist: FunctionComponent<Props> = function InspectChecklist({
  name,
  items,
  handleToggle,
}) {
  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">{name}</legend>
      {items.map(item => (
        <div key={item.id}>
          <InspectItemCheckbox {...item} onChange={handleToggle(item.name)} />
        </div>
      ))}
    </fieldset>
  );
};
