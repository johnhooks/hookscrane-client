import type { NextPage, GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  InspectType,
  DailyInspectByIdDocument,
  DailyInspectByIdQuery,
  DailyInspectByIdQueryVariables,
  useDailyInspectByIdQuery,
} from "generated/types";
import { initializeApollo, addApolloState } from "lib/apollo-client";
import { fetchAccessToken } from "lib/auth";
import { DailyInspectShow, InspectItem } from "components/daily-inspect/show";

import craneData from "data/crane-data.json";
import vehicleInspectItemData from "data/daily-vehicle-inspect.json";
import craneInspectItemDate from "data/daily-crane-inspection.json";

const InspectPage: NextPage = () => {
  const router = useRouter();
  if (typeof router.query.id !== "string") throw new Error("Not found");
  const id = parseInt(router.query.id);
  if (isNaN(id)) throw new Error("Not found");

  const { data, loading, error } = useDailyInspectByIdQuery({ variables: { id } });

  if (loading) return <p>loading...</p>;
  if (error) throw error;
  if (!data?.dailyInspectById) throw new Error("Not found");

  const { type, hours, datetime, meta } = data.dailyInspectById;
  const title = type === InspectType.Vehicle ? "Daily Vehicle Inspection" : "Daily Crane Inspection";
  const deficiencies = (meta?.deficiencies as string[]) || [];
  const inspectItemData = type === InspectType.Vehicle ? vehicleInspectItemData : craneInspectItemDate;
  const items: InspectItem[] = inspectItemData.map(({ name, label }) => ({
    id: `inspect-${name}`,
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
      <DailyInspectShow title={title} datetime={new Date(datetime)} details={details} items={items} />
    </>
  );
};

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

  const accessToken = await fetchAccessToken(ctx);
  const apolloClient = initializeApollo(null, accessToken);

  await apolloClient.query<DailyInspectByIdQuery, DailyInspectByIdQueryVariables>({
    query: DailyInspectByIdDocument,
    variables: {
      id,
    },
  });

  return addApolloState(apolloClient);
};

export default InspectPage;
