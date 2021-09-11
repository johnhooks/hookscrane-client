import type { FunctionComponent, DetailedHTMLProps, InputHTMLAttributes } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/solid";

import type { UseTextInputState } from "hooks/use-input-state";

interface TextInputProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "password" | "date" | "time";
  placeholder?: string | undefined;
  className?: string | undefined;
  description?: string | undefined;
  showErrors?: boolean;
}

export type Props = UseTextInputState & TextInputProps;

const baseClassName = "block w-full rounded-md sm:text-sm shadow-sm";
const validClassName = "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
const invalidClassName = "pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500"; //prettier-ignore

export const TextInput: FunctionComponent<Props> = function TextInput({
  id,
  name,
  label,
  value,
  onBlur,
  onChange,
  type = "text",
  placeholder,
  description,
  error,
  showErrors,
}) {
  const invalid = Boolean(showErrors && error);
  const className = baseClassName + " " + (invalid ? invalidClassName : validClassName);

  const inputProps: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> = {
    id,
    type,
    name,
    value,
    className,
    placeholder,
    onBlur,
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
      <section id={`${id}-description`} className="mt-2 flex flex-col gap-y-2 text-sm">
        {description && <p className="text-gray-500">{description}</p>}
        {invalid && (
          <p id={`${id}-error`} className="text-red-600">
            {label} {error}
          </p>
        )}
      </section>
    </div>
  );
};
