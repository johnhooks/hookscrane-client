import type { PropsWithChildren } from "react";
import { InspectItemCheckbox, CheckboxProps } from "./inspect-item-checkbox";

export interface Props<Checkbox extends CheckboxProps> {
  name: string;
  items: Checkbox[];
}

export function InspectChecklist<Checkbox extends CheckboxProps>({ name, items }: PropsWithChildren<Props<Checkbox>>) {
  return (
    <fieldset className="flex flex-col space-y-4 sm:space-y-6">
      <legend className="sr-only">{name}</legend>
      {items.map(item => (
        <div key={item.id}>
          <InspectItemCheckbox {...item} />
        </div>
      ))}
    </fieldset>
  );
}
