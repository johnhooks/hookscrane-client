import type { PropsWithChildren } from "react";
import { Checkbox, Props as CheckboxProps } from "./checkbox";

export interface Props {
  name: string;
  items: CheckboxProps[];
}

export function Checklist({ name, items }: PropsWithChildren<Props>) {
  return (
    <fieldset className="flex flex-col space-y-4 sm:space-y-6">
      <legend className="sr-only">{name}</legend>
      {items.map(item => (
        <div key={item.id}>
          <Checkbox {...item} />
        </div>
      ))}
    </fieldset>
  );
}
