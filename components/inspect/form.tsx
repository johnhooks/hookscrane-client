import type { Dispatch, ChangeEvent, FormEventHandler, PropsWithChildren, SetStateAction } from "react";

import type { Props as CheckboxProps } from "components/form/checkbox";
import type { Action as FormAction, CheckboxState, TextInputState } from "lib/interfaces/form";
import { TextInput } from "components/form/text-input";
import { Checklist } from "components/form/checklist";
import { Checkbox } from "components/form/checkbox";
import { DetailList, DetailItemProps } from "components/detail-list";

export type InspectItem = Omit<CheckboxProps, "error" | "onChange">;

type InputsProp = {
  date: TextInputState;
  signature: CheckboxState;
  time: TextInputState;
};

type Action = FormAction<InputsProp>;

interface Props<Detail extends DetailItemProps, Inputs extends InputsProp, Item extends InspectItem> {
  details: Detail[];
  dispatch: Dispatch<Action>;
  hasSubmitted: boolean;
  inputs: Inputs;
  inspectItems: Item[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  setInspectItems: (value: SetStateAction<Item[]>) => void;
}

export function InspectForm<Detail extends DetailItemProps, Inputs extends InputsProp, Item extends InspectItem>({
  children,
  details,
  dispatch,
  hasSubmitted,
  inputs,
  inspectItems,
  onSubmit,
  setInspectItems,
}: PropsWithChildren<Props<Detail, Inputs, Item>>) {
  const handleCheckboxToggle = function (name: string) {
    return function (e: ChangeEvent<HTMLInputElement>) {
      // e.preventDefault(); // Can't be used or the checkbox won't display the check mark
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

  function handleSignatureToggle(e: ChangeEvent<HTMLInputElement>) {
    // e.preventDefault(); // Can't be used or the checkbox won't display the check mark
    dispatch({ type: "checkbox:toggle", name: "signature" });
  }

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
          <TextInput
            error={inputs.date.error}
            id="date-input"
            label="Date"
            name="date"
            onBlur={e => {
              dispatch({ type: "input:blur", name: "date" });
            }}
            onChange={e => {
              e.preventDefault();
              const value = e.target.value;
              dispatch({ type: "input:update", name: "date", value });
            }}
            value={inputs.date.value}
            showErrors={hasSubmitted || inputs.date.hasBlurred}
            type="date"
          />
        </div>
        <div>
          <TextInput
            error={inputs.time.error}
            id="time-input"
            label="Time"
            name="time"
            onBlur={e => {
              dispatch({ type: "input:blur", name: "time" });
            }}
            onChange={e => {
              e.preventDefault();
              const value = e.target.value;
              dispatch({ type: "input:update", name: "time", value });
            }}
            value={inputs.time.value}
            showErrors={hasSubmitted || inputs.time.hasBlurred}
            type="time"
          />
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
              checked={inputs.signature.value}
              error={inputs.signature.error}
              id="accept-input"
              label="I, John Hooks, accept and digitally sign this form"
              name="signature"
              onChange={handleSignatureToggle}
              showErrors={hasSubmitted}
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
