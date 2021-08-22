import type { NextPage } from "next";
import { useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import type { CheckboxProps } from "components/inspect-item-checkbox";
import { useCreateDailyInspectMutation, InspectType } from "generated/types";
import { DailyInspect, InspectItem } from "components/daily-inspect";

import craneData from "data/crane-data.json";
import craneInspectItemData from "data/daily-crane-inspection.json";

const NewInspect: NextPage = () => {
  const checkboxesMemo: Omit<CheckboxProps, "onChange">[] = useMemo(() => {
    return craneInspectItemData.map(({ name, label, description }) => ({
      id: `${name}-input`,
      name,
      label,
      checked: true,
      description,
    }));
  }, []);

  const router = useRouter();
  const [createDailyInspect, { data, loading, error }] = useCreateDailyInspectMutation();

  if (loading) return <p>Submitting...</p>;
  if (error) return <p>Submission error! {error.message}</p>;

  const details = [
    { name: "vehicle-make", label: "Make", value: craneData.make },
    { name: "vehicle-model", label: "Model", value: craneData.model },
    { name: "vehicle-vin", label: "VIN", value: craneData.vin },
    { name: "owner-id", label: "Owner ID Number", value: craneData.id },
  ];

  function handleSubmit<Item extends InspectItem>({
    datetime,
    hours,
    items,
  }: {
    datetime: Date;
    hours: number;
    items: Item[];
  }) {
    try {
      const deficiencies = items.filter(item => !item.checked).map(item => item.name);
      const meta = deficiencies.length > 0 ? { deficiencies } : {};
      createDailyInspect({
        variables: {
          data: {
            type: InspectType.Crane,
            datetime,
            hours,
            meta,
          },
        },
      }).then(result => {
        const inspectId = result.data?.createDailyInspect?.id;
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
        <title>New Daily Crane Inspection - Hooks Crane</title>
        <meta name="description" content="New crane inspection form" />
      </Head>
      <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Daily Crane Inspection</h2>
          </div>
          <DailyInspect details={details} inspectItems={checkboxesMemo} handleSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
};

export default NewInspect;
