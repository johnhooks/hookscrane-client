import type { NextPage, GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  DocType,
  DocumentByIdDocument,
  DocumentByIdQuery,
  DocumentByIdQueryVariables,
  useDocumentByIdQuery,
} from "generated/types";
import { initializeApollo, addApolloState } from "lib/apollo-client";
import { fetchAccessToken } from "lib/fetch-access-token";
import { Page } from "components/page";
import { InspectShow, InspectItem } from "components/inspect/show";

import craneData from "data/crane-data.json";
import vehicleInspectItemData from "data/daily-vehicle-inspect.json";
import craneInspectItemDate from "data/daily-crane-inspection.json";

const InspectPage: NextPage = () => {
  const router = useRouter();
  if (typeof router.query.id !== "string") throw new Error("Not found");
  const id = parseInt(router.query.id);
  if (isNaN(id)) throw new Error("Not found");

  const { data, loading, error } = useDocumentByIdQuery({ variables: { id } });

  if (loading) return <p>loading...</p>;
  if (error) throw error;
  if (!data?.documentById) throw new Error("Not found");

  const { datetime, hours, meta, miles, type } = data.documentById;
  const title = type === DocType.InspectVehicleDaily ? "Daily Vehicle Inspection" : "Frequent Crane Inspection";
  const deficiencies = (meta?.deficiencies as string[]) || [];
  const inspectItemData = type === DocType.InspectVehicleDaily ? vehicleInspectItemData : craneInspectItemDate;
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
    { name: "performed-by", label: "Inspection Performed By", value: "John Hooks II" },
  ];

  if (typeof hours === "number") {
    details.push({ name: "vehicle-hours", label: "Hours", value: hours.toString() });
  }

  if (typeof miles === "number") {
    details.push({ name: "vehicle-miles", label: "Miles", value: miles.toString() });
  }

  return (
    <>
      <Head>
        <title>{title} - Hooks Crane</title>
        <meta name="description" content={`${title} ID: ${id}`} />
      </Head>
      <Page title={title} date={new Date(datetime)}>
        <div className="max-w-2xl mx-auto mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8">
          <InspectShow details={details} items={items} />
        </div>
      </Page>
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

  const accessToken = await fetchAccessToken(ctx);
  const apolloClient = initializeApollo(null, accessToken);

  await apolloClient.query<DocumentByIdQuery, DocumentByIdQueryVariables>({
    query: DocumentByIdDocument,
    variables: {
      id,
    },
  });

  return addApolloState(apolloClient);
};
