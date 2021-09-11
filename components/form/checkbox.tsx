import type { PropsWithChildren } from "react";

import type { UseCheckboxState } from "hooks/use-checkbox-state";

interface CheckboxProps {
  id: string;
  name: string;
  label: string;
  description?: string;
  showErrors?: boolean;
}

export type Props = Omit<UseCheckboxState, "error"> & CheckboxProps & { error?: string | null };

export function Checkbox({
  id,
  name,
  label,
  checked,
  onChange,
  description,
  error,
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
