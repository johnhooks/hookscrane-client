import type { NextPage } from "next";
import type { FormEventHandler } from "react";
import { useState, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { format as formatDate } from "date-fns";

import { useCreateDailyInspectMutation, InspectType } from "generated/types";
import { TextInput, Props as TextInputProps } from "components/text-input";
import { InspectChecklist, InspectItem } from "components/inspect-checklist";
import { DetailList } from "components/detail-list";
import { mapToDate } from "lib/date";

import craneData from "data/crane-data.json";
import inspectItemData from "data/daily-vehicle-inspect.json";

type OnChangeHandler = TextInputProps["onChange"];
type OnToggleHandler = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;

const NewInspect: NextPage = () => {
  const datetime = new Date();
  const checklistItemsMemo: InspectItem[] = useMemo(() => {
    return inspectItemData.map(({ name, label }) => ({
      id: `${name}-input`,
      name,
      label,
      checked: true,
    }));
  }, []);
  const [checklistItems, setChecklistItems] = useState(checklistItemsMemo);
  const [date, setDate] = useState(formatDate(datetime, "yyyy-MM-dd"));
  const [time, setTime] = useState(formatDate(datetime, "HH:mm"));
  const [hours, setHours] = useState(0);
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

  const handleChecklistItemToggle: OnToggleHandler = function (name: string) {
    return function (e) {
      setChecklistItems(prevState => {
        const item = prevState.find(item => item.name === name);
        console.log(item);
        if (item) {
          const updatedItem = { ...item, checked: !item.checked };
          const updatedState = prevState.map(item => (item.name === name ? updatedItem : item));
          return [...updatedState];
        }
        return prevState;
      });
    };
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    try {
      const datetime = mapToDate({ date, time });
      const deficiencies = checklistItems.filter(item => !item.checked).map(item => item.name);
      const meta = deficiencies.length > 0 ? { deficiencies } : {};
      createDailyInspect({
        variables: {
          data: {
            type: InspectType.Vehicle,
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
  };

  return (
    <>
      <Head>
        <title>New Daily DOT Inspection - Hooks Crane</title>
        <meta name="description" content="new inspection form" />
      </Head>
      <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Daily DOT Inspection
            </h2>
          </div>
          <div className="mt-12">
            <DetailList items={details} />
            <form
              action="#"
              method="POST"
              className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 mt-6"
              onSubmit={handleSubmit}
            >
              <div>
                <TextInput
                  type="date"
                  value={date}
                  id="date-input"
                  name="date"
                  label="Date"
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <TextInput
                  type="time"
                  value={time}
                  id="time-input"
                  name="time"
                  label="Time"
                  onChange={handleTimeChange}
                />
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
                  items={checklistItems}
                  handleToggle={handleChecklistItemToggle}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default NewInspect;
