import type { ChangeEventHandler, MouseEventHandler, PropsWithChildren } from "react";

import type { Nullish } from "lib/interfaces";

export interface Props {
  checked: boolean;
  description?: string;
  error?: string | Nullish;
  id: string;
  label: string;
  name: string;
  onChange: ChangeEventHandler;
  showErrors?: boolean;
}

export function Checkbox({
  checked,
  description,
  error,
  id,
  label,
  name,
  onChange,
  showErrors,
}: PropsWithChildren<Props>) {
  const invalid = Boolean(showErrors && error);
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          aria-describedby={`${id}-description`}
          aria-invalid={invalid}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-gray-700">
          {label}
        </label>
        <section id={`${id}-description`} className="mt-2 flex flex-col gap-y-2">
          {description && <p className="text-gray-500">{description}</p>}
          {invalid && (
            <p id={`${id}-error`} className="text-red-600">
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
