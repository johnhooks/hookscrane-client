import type { PropsWithChildren } from "react";

export interface Props {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
  note?: string;
}

export function Checkbox({ id, name, label, checked, onChange, description }: PropsWithChildren<Props>) {
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          aria-describedby={`${id}-description`}
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
        {description && (
          <p id={`${id}-description`} className="text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
