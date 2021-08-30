import type { NextPage } from "next";
import type { ChangeEvent } from "react";

import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { useCreateDailyVehicleInspectMutation } from "generated/types";
import { DailyInspectForm, InspectItem } from "components/inspect/form";
import { TextInput } from "components/text-input";

import craneData from "data/crane-data.json";
import vehicleInspectItemData from "data/daily-vehicle-inspect.json";

const NewInspect: NextPage = () => {
  const checkboxesMemo: InspectItem[] = useMemo(() => {
    return vehicleInspectItemData.map(({ name, label }) => ({
      id: `${name}-input`,
      name,
      label,
      checked: true,
    }));
  }, []);

  const router = useRouter();
  const [create, { data, loading, error }] = useCreateDailyVehicleInspectMutation();
  const [miles, setMiles] = useState("");
  const [items, setItems] = useState(checkboxesMemo);

  if (loading) return <p>Submitting...</p>;
  if (error) return <p>Submission error! {error.message}</p>;

  const details = [
    { name: "vehicle-make", label: "Make", value: craneData.make },
    { name: "vehicle-model", label: "Model", value: craneData.model },
    { name: "vehicle-vin", label: "VIN", value: craneData.vin },
    { name: "owner-id", label: "Owner ID Number", value: craneData.id },
  ];

  const handleMilesChange: (e: ChangeEvent<HTMLInputElement>) => void = e => {
    const value = e.target.value;

    // Allow the value to be blank
    if (value === "") {
      setMiles("");
      return;
    }

    // Only change the value if it looks like an integer
    if (/^\d+$/.test(value)) {
      const int = parseInt(e.target.value);
      if (!isNaN(int)) {
        setMiles(e.target.value);
        return;
      }
    }
  };

  function handleSubmit({ datetime }: { datetime: Date }) {
    try {
      const deficiencies = items.filter(item => !item.checked).map(item => item.name);
      const meta = deficiencies.length > 0 ? { deficiencies } : {};
      const milesParsed = parseInt(miles);
      if (isNaN(milesParsed)) throw new Error("Invalid miles value");
      create({
        variables: {
          data: {
            datetime,
            miles: milesParsed,
            meta,
          },
        },
      }).then(result => {
        const inspectId = result.data?.createDailyVehicleInspect?.id;
        if (inspectId) {
          router.push(`/inspect/vehicle/${inspectId}`);
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
        <title>New Daily Vehicle Inspection - Hooks Crane</title>
        <meta name="description" content="New vehicle inspection form" />
      </Head>
      <header className="bg-white sm:shadow">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Vehicle Inspection</h1>
        </div>
      </header>
      <div className="mt-4 sm:mt-6 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <DailyInspectForm
            details={details}
            inspectItems={items}
            setInspectItems={setItems}
            handleSubmit={handleSubmit}
          >
            <div className="sm:col-span-2">
              <TextInput
                value={miles.toString()}
                id="miles-input"
                name="miles"
                label="Miles"
                onChange={handleMilesChange}
              />
            </div>
          </DailyInspectForm>
        </div>
      </div>
    </>
  );
};

export default NewInspect;
