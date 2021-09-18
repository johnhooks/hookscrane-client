import type { NextPage } from "next";
import type { FormEventHandler } from "react";
import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { format as formatDate } from "date-fns";

import { useCreateFrequentInspectMutation } from "generated/types";
import { InspectForm, InspectItem } from "components/inspect/form";
import { TextInput } from "components/form/text-input";
import { Alert } from "components/notification/alert";
import { useFormState, initialTextInputState, initialCheckboxState } from "hooks/use-form-state";
import { validateDate, validateInteger, validateTime } from "helpers/validators";
import { mapToDate } from "lib/date";

import craneData from "data/crane-data.json";
import craneInspectItemData from "data/daily-crane-inspection.json";

const NewInspect: NextPage = () => {
  const datetime = useMemo(() => new Date(), []);

  const checkboxesMemo: InspectItem[] = useMemo(() => {
    return craneInspectItemData.map(({ name, label, description }) => ({
      id: `${name}-input`,
      name,
      label,
      checked: true,
      description,
    }));
  }, []);

  const router = useRouter();
  const [create, { data, loading, error }] = useCreateFrequentInspectMutation();
  const [items, setItems] = useState(checkboxesMemo);

  const [state, dispatch] = useFormState({
    inputs: {
      date: initialTextInputState({ value: formatDate(datetime, "yyyy-MM-dd"), validate: validateDate }),
      hours: initialTextInputState({ validate: validateInteger }),
      signature: initialCheckboxState({
        validate: function (value) {
          return value !== true ? "Inspection must be digitally signed before submitting" : null;
        },
      }),
      time: initialTextInputState({ value: formatDate(datetime, "HH:mm"), validate: validateTime }),
    },
  });

  if (data || loading) return <div className="text-center mt-6 text-xl">Submitting...</div>;
  if (error) return <div className="text-center mt-6 text-xl">Submission error! {error.message}</div>;

  const errors = (Object.keys(state.inputs) as Array<keyof typeof state.inputs>)
    .map(name => ({ name, input: state.inputs[name] }))
    .filter(({ input }) => typeof input.error === "string")
    .map(({ name, input: { error } }) => ({ name, error })) as Array<{
    name: keyof typeof state.inputs;
    error: string;
  }>;

  const details = [
    { name: "vehicle-make", label: "Make", value: craneData.make },
    { name: "vehicle-model", label: "Model", value: craneData.model },
    { name: "vehicle-vin", label: "VIN", value: craneData.vin },
    { name: "owner-id", label: "Owner ID Number", value: craneData.id },
  ];

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    if (!state.hasSubmitted) {
      return dispatch({ type: "submit" });
    }

    const errors = (Object.keys(state.inputs) as Array<keyof typeof state.inputs>)
      .map(name => ({ name, input: state.inputs[name] }))
      .filter(({ input }) => typeof input.error === "string")
      .map(({ name, input: { error } }) => ({ name, error })) as Array<{
      name: keyof typeof state.inputs;
      error: string;
    }>;

    if (errors.length === 0) {
      const deficiencies = items.filter(item => !item.checked).map(item => item.name);
      const meta = deficiencies.length > 0 ? { deficiencies } : {};
      const hoursParsed = parseInt(state.inputs.hours.value);
      if (isNaN(hoursParsed)) throw new Error("Invalid hours value");
      const datetime = mapToDate({ date: state.inputs.date.value, time: state.inputs.time.value });

      create({
        variables: {
          data: {
            datetime,
            hours: hoursParsed,
            meta,
          },
        },
      }).then(result => {
        const inspectId = result.data?.createFrequentInspect?.id;
        if (inspectId) {
          router.push(`/inspect/${inspectId}`);
          return;
        }
        throw new Error("Received unexpected input during daily inspection form submission");
      });
    }

    dispatch({ type: "submit" });
  };

  return (
    <>
      <Head>
        <title>New Frequent Crane Inspection - Hooks Crane</title>
        <meta name="description" content="New crane inspection form" />
      </Head>
      <header className="bg-white sm:shadow">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Crane Inspection</h1>
        </div>
      </header>
      {state.hasSubmitted && errors.length > 0 && (
        <div className="mt-4 sm:mt-6  px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <Alert message={{ heading: "There are errors on this form", status: "warning" }}>
              <ul role="list" className="list-disc pl-5 space-y-1">
                {errors.map(error => (
                  <li key={error.name}>
                    {error.name} {error.error}
                  </li>
                ))}
              </ul>
            </Alert>
          </div>
        </div>
      )}
      <div className="mt-4 sm:mt-6 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <InspectForm
            details={details}
            dispatch={dispatch}
            inputs={state.inputs}
            inspectItems={items}
            hasSubmitted={state.hasSubmitted}
            setInspectItems={setItems}
            onSubmit={handleSubmit}
          >
            <div className="sm:col-span-2">
              <TextInput
                id="hours-input"
                name="hours"
                label="Hours"
                value={state.inputs.hours.value}
                error={state.inputs.hours.error}
                onBlur={e => {
                  dispatch({ type: "input:blur", name: "hours" });
                }}
                onChange={e => {
                  e.preventDefault();
                  const value = e.target.value;
                  dispatch({ type: "input:update", name: "hours", value });
                }}
                showErrors={state.hasSubmitted || state.inputs.hours.hasBlurred}
              />
            </div>
          </InspectForm>
        </div>
      </div>
    </>
  );
};

export default NewInspect;
