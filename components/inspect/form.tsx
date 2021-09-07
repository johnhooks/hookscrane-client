import type { ChangeEvent, FormEventHandler, PropsWithChildren, SetStateAction } from "react";
import { useState } from "react";
import { format as formatDate } from "date-fns";

import type { Props as CheckboxProps } from "components/form/checkbox";
import { TextInput, Props as TextInputProps } from "components/form/text-input";
import { Checklist } from "components/form/checklist";
import { Checkbox } from "components/form/checkbox";
import { DetailList, DetailItemProps } from "components/detail-list";
import { mapToDate } from "lib/date";

type OnChangeHandler = TextInputProps["onChange"];

export type InspectItem = Omit<CheckboxProps, "onChange">;

interface Props<Item extends InspectItem, Detail extends DetailItemProps> {
  details: Detail[];
  inspectItems: Item[];
  setInspectItems: (value: SetStateAction<Item[]>) => void;
  handleSubmit: (data: { datetime: Date }) => void;
}

export function InspectForm<Item extends InspectItem, Detail extends DetailItemProps>({
  details,
  inspectItems,
  setInspectItems,
  handleSubmit,
  children,
}: PropsWithChildren<Props<Item, Detail>>) {
  const datetime = new Date();
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [date, setDate] = useState(formatDate(datetime, "yyyy-MM-dd"));
  const [time, setTime] = useState(formatDate(datetime, "HH:mm"));

  const handleAcceptChange: (e: React.ChangeEvent<HTMLInputElement>) => void = e => {
    setAccepted(!accepted);
  };

  const handleDateChange: OnChangeHandler = e => {
    setDate(e.target.value);
  };

  const handleTimeChange: OnChangeHandler = e => {
    setTime(e.target.value);
  };

  const handleCheckboxToggle = function (name: string) {
    return function (e: ChangeEvent<HTMLInputElement>) {
      e.preventDefault();
      setInspectItems(prevState => {
        const item = prevState.find(item => item.name === name);
        if (item) {
          const updatedItem = { ...item, checked: !item.checked };
          const updatedState = prevState.map(item => (item.name === name ? updatedItem : item));
          return [...updatedState];
        }
        return prevState;
      });
    };
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    try {
      const datetime = mapToDate({ date, time });
      if (!accepted) {
        throw new Error("Inspection must be accepted and digitally signed to submit");
      }
      handleSubmit({ datetime });
    } catch (error) {
      // TODO Display an error about an invalid date.
      console.error(error);
    }
  };

  return (
    <>
      <header className="text-center">
        <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">Details</h3>
      </header>
      <div className="mt-2 sm:mt-4">
        <DetailList items={details} />
      </div>
      <form
        action="#"
        method="POST"
        className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 mt-6"
        onSubmit={onSubmit}
      >
        <div>
          <TextInput type="date" value={date} id="date-input" name="date" label="Date" onChange={handleDateChange} />
        </div>
        <div>
          <TextInput type="time" value={time} id="time-input" name="time" label="Time" onChange={handleTimeChange} />
        </div>
        {/*
          KLUDGE: This seems like a hack, but its working.
          The daily vehicle and frequent crane inspections share the same database table,
          but they have different requirements for criteria and details. The children prop
          is to allow the forms to add their own form fields. Right now its for hours or miles
          depending on what the form needs.
         */}
        {children}
        <div className="sm:col-span-2 mt-2 sm:mt-4">
          <header className="text-center">
            <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">Criteria</h3>
          </header>
          <Checklist
            name="Inspection criteria"
            items={inspectItems.map(item => ({
              ...item,
              onChange: handleCheckboxToggle(item.name),
            }))}
          />
        </div>
        <section className="sm:col-span-2 mt-2 sm:mt-4">
          <header className="text-center">
            <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">Signature</h3>
          </header>
          <div className="mt-2 sm:mt-4">
            <Checkbox
              id="accept-input"
              name="accept"
              checked={accepted ?? false}
              label="I, John Hooks, accept and digitally sign this form"
              onChange={handleAcceptChange}
              invalid={accepted !== null && !accepted}
              description={accepted !== null && !accepted ? "Signature is required to submit" : undefined}
            />
          </div>
        </section>
        <div className="sm:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Inspection
          </button>
        </div>
      </form>
    </>
  );
}
