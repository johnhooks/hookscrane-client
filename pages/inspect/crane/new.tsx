import type { NextPage } from "next";
import type { ChangeEvent } from "react";

import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { useCreateFrequentInspectMutation, InspectType } from "generated/types";
import { DailyInspectForm, InspectItem } from "components/daily-inspect/form";
import { TextInput } from "components/text-input";

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
  const [hours, setHours] = useState(0);
  const [items, setItems] = useState(checkboxesMemo);

  if (loading) return <p>Submitting...</p>;
  if (error) return <p>Submission error! {error.message}</p>;

  const details = [
    { name: "vehicle-make", label: "Make", value: craneData.make },
    { name: "vehicle-model", label: "Model", value: craneData.model },
    { name: "vehicle-vin", label: "VIN", value: craneData.vin },
    { name: "owner-id", label: "Owner ID Number", value: craneData.id },
  ];

  const handleHoursChange: (e: ChangeEvent<HTMLInputElement>) => void = e => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) setHours(value);
  };

  function handleSubmit({ datetime }: { datetime: Date }) {
    try {
      const deficiencies = items.filter(item => !item.checked).map(item => item.name);
      const meta = deficiencies.length > 0 ? { deficiencies } : {};
      create({
        variables: {
          data: {
            datetime,
            hours,
            meta,
          },
        },
      }).then(result => {
        const inspectId = result.data?.createFrequentInspect?.id;
        if (inspectId) {
          router.push(`/inspect/crane/${inspectId}`);
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
        <title>New Daily Crane Inspection - Hooks Crane</title>
        <meta name="description" content="New crane inspection form" />
      </Head>
      <header className="bg-white sm:shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Crane Inspection</h1>
        </div>
      </header>
      <div className="mt-4 sm:mt-6overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <DailyInspectForm
            details={details}
            inspectItems={checkboxesMemo}
            setInspectItems={setItems}
            handleSubmit={handleSubmit}
          >
            <div className="sm:col-span-2">
              <TextInput
                value={hours.toString()}
                id="hours-input"
                name="hours"
                label="Hours"
                onChange={handleHoursChange}
              />
            </div>
          </DailyInspectForm>
        </div>
      </div>
    </>
  );
};

export default NewInspect;
