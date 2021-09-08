import type { NextPage } from "next";
import type { ChangeEvent } from "react";

import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { useCreateFrequentInspectMutation } from "generated/types";
import { InspectForm, InspectItem } from "components/inspect/form";
import { TextInput } from "components/form/text-input";
import { useTextInputState } from "hooks/use-input-state";
import { validateInteger } from "helpers/validators";

import craneData from "data/crane-data.json";
import craneInspectItemData from "data/daily-crane-inspection.json";

const NewInspect: NextPage = () => {
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
  const hours = useTextInputState({ value: "" }, validateInteger);
  const [items, setItems] = useState(checkboxesMemo);

  if (data || loading) return <p>Submitting...</p>;
  if (error) return <p>Submission error! {error.message}</p>;

  const details = [
    { name: "vehicle-make", label: "Make", value: craneData.make },
    { name: "vehicle-model", label: "Model", value: craneData.model },
    { name: "vehicle-vin", label: "VIN", value: craneData.vin },
    { name: "owner-id", label: "Owner ID Number", value: craneData.id },
  ];

  const handleHoursChange: (e: ChangeEvent<HTMLInputElement>) => void = e => {
    const value = e.target.value;

    // Allow the value to be blank
    if (value === "") {
      return hours.onChange(e);
    }

    // Only change the value if it looks like an integer
    if (/^\d+$/.test(value)) {
      const int = parseInt(e.target.value);
      if (!isNaN(int)) {
        return hours.onChange(e);
      }
    }
  };

  function handleSubmit({ datetime, invalid }: { datetime: Date; invalid: boolean }) {
    try {
      const deficiencies = items.filter(item => !item.checked).map(item => item.name);
      const meta = deficiencies.length > 0 ? { deficiencies } : {};
      const hoursParsed = parseInt(hours.value);
      if (isNaN(hoursParsed)) throw new Error("Invalid hours value");
      if (invalid) return;

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
    } catch (error) {
      console.log(error);
    }
  }

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
      <div className="mt-4 sm:mt-6overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <InspectForm details={details} inspectItems={items} setInspectItems={setItems} handleSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <TextInput id="hours-input" name="hours" label="Hours" {...hours} onChange={handleHoursChange} />
            </div>
          </InspectForm>
        </div>
      </div>
    </>
  );
};

export default NewInspect;
