import type { FunctionComponent, DetailedHTMLProps, InputHTMLAttributes } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/solid";

export interface Props {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "number" | "password" | "date" | "time";
  placeholder?: string | undefined;
  className?: string | undefined;
  invalid?: boolean | undefined;
  description?: string | undefined;
}

const baseClassName = "block w-full rounded-md sm:text-sm shadow-sm";
const validClassName = "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
const invalidClassName = "pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"; //prettier-ignore

export const TextInput: FunctionComponent<Props> = function TextInput({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  invalid,
  description,
}) {
  const className = baseClassName + " " + (invalid ? invalidClassName : validClassName);

  const inputProps: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> = {
    id,
    type,
    name,
    value,
    className,
    placeholder,
    onChange,
    "aria-describedby": description ? `${id}-description` : undefined,
    "aria-invalid": invalid,
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input {...inputProps} />
        {invalid && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {description && (
        <p id={`${id}-description`} className={`mt-2 text-sm ${invalid ? "text-red-600" : "text-gray-500"}`}>
          {description}
        </p>
      )}
    </div>
  );
};
