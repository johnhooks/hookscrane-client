import type { NextPage, GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  DailyInspectByIdDocument,
  DailyInspectByIdQuery,
  DailyInspectByIdQueryVariables,
  useDailyInspectByIdQuery,
} from "generated/types";
import { initializeApollo } from "lib/apollo-client";

import { InspectList, ItemDetail } from "components/inspect-list";
import { DetailList } from "components/detail-list";
import { DateFormat } from "components/date-format";
import { TimeFormat } from "components/time-format";

import craneData from "data/crane-data.json";
import inspectItemData from "data/daily-vehicle-inspect.json";

const InspectPage: NextPage = () => {
  const router = useRouter();
  if (typeof router.query.id !== "string") throw new Error("Not found");
  const id = parseInt(router.query.id);
  if (isNaN(id)) throw new Error("Not found");

  const { data, loading, error } = useDailyInspectByIdQuery({ variables: { id } });

  if (loading) return <p>loading...</p>;
  if (error) throw error;
  if (!data?.dailyInspectById) throw new Error("Not found");

  const { hours, meta } = data.dailyInspectById;
  const deficiencies = (meta?.deficiencies as string[]) || [];
  const items: ItemDetail[] = inspectItemData.map(({ name, label }) => ({
    name,
    label,
    checked: !deficiencies.includes(name),
  }));

  const details = [
    { name: "vehicle-make", label: "Make", value: craneData.make },
    { name: "vehicle-model", label: "Model", value: craneData.model },
    { name: "vehicle-vin", label: "VIN", value: craneData.vin },
    { name: "owner-id", label: "Owner ID Number", value: craneData.id },
    { name: "vehicle-hours", label: "Hours", value: hours.toString() },
    { name: "performed-by", label: "Inspection Performed By", value: "John Hooks II" },
  ];

  return (
    <>
      <Head>
        <title>Daily Vehicle Inspection - Hooks Crane</title>
        <meta name="description" content={`Daily Vehicle Inspection ID: ${id}`} />
      </Head>

      <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24 print:text-sm">
        <div className="max-w-xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Vehicle Inspection
            </h2>
            <p className="mt-4 sm:text-xl text-gray-500">
              <span>
                <DateFormat date={new Date(data.dailyInspectById.datetime)} />
              </span>
              <span className="ml-4">
                <TimeFormat date={new Date(data.dailyInspectById.datetime)} />
              </span>
            </p>
          </div>
          <div className="mt-4">
            <div>
              <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Details
              </h3>
            </div>
            <DetailList items={details} className="mt-4" />
            <div className="mt-8">
              <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Criteria
              </h3>
              <div className="mt-4">
                <InspectList items={items} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InspectPage;

export const getServerSideProps: GetServerSideProps = async function (ctx) {
  if (typeof ctx.params?.id !== "string") {
    ctx.res.statusCode = 404;
    throw new Error("Not found");
  }

  const id = parseInt(ctx.params?.id);

  if (isNaN(id)) {
    ctx.res.statusCode = 404;
    throw new Error("Not found");
  }

  const apolloClient = initializeApollo(null);

  await apolloClient.query<DailyInspectByIdQuery, DailyInspectByIdQueryVariables>({
    query: DailyInspectByIdDocument,
    variables: {
      id,
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};
