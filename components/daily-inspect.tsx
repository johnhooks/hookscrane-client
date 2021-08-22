import type { FormEventHandler, PropsWithChildren, ChangeEvent } from "react";
import { useState } from "react";
import { format as formatDate } from "date-fns";

import type { CheckboxProps } from "./inspect-item-checkbox";
import { TextInput, Props as TextInputProps } from "components/text-input";
import { InspectChecklist } from "components/inspect-checklist";
import { DetailList, DetailItemProps } from "components/detail-list";
import { mapToDate } from "lib/date";

type OnChangeHandler = TextInputProps["onChange"];

export type InspectItem = Omit<CheckboxProps, "onChange">;

interface Props<Item extends InspectItem, Detail extends DetailItemProps> {
  details: Detail[];
  inspectItems: Item[];
  handleSubmit: (data: { datetime: Date; hours: number; items: Item[] }) => void;
}

export function DailyInspect<Item extends InspectItem, Detail extends DetailItemProps>({
  details,
  inspectItems,
  handleSubmit,
}: PropsWithChildren<Props<Item, Detail>>) {
  const datetime = new Date();
  const [items, setItems] = useState(inspectItems);
  const [date, setDate] = useState(formatDate(datetime, "yyyy-MM-dd"));
  const [time, setTime] = useState(formatDate(datetime, "HH:mm"));
  const [hours, setHours] = useState(0);

  const handleDateChange: OnChangeHandler = e => {
    setDate(e.target.value);
  };

  const handleTimeChange: OnChangeHandler = e => {
    setTime(e.target.value);
  };

  const handleHoursChange: OnChangeHandler = e => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) setHours(value);
  };

  const handleCheckboxToggle = function (name: string) {
    return function (e: ChangeEvent<HTMLInputElement>) {
      e.preventDefault();
      setItems(prevState => {
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
      handleSubmit({ datetime, hours, items });
    } catch (error) {
      // TODO Display an error about an invalid date.
      console.log(error);
    }
  };

  return (
    <>
      <DetailList items={details} />
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
        <div className="sm:col-span-2">
          <TextInput
            type="number"
            value={hours.toString()}
            id="hours-input"
            name="hours"
            label="Hours"
            onChange={handleHoursChange}
          />
        </div>
        <div className="sm:col-span-2">
          <InspectChecklist
            name="Inspection criteria"
            items={items.map(item => ({
              ...item,
              onChange: handleCheckboxToggle(item.name),
            }))}
          />
        </div>
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
