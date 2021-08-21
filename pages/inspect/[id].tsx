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

  if (loading) return <p>loading</p>;
  if (error) throw error;
  if (data?.dailyInspectById) {
    const { meta } = data.dailyInspectById;
    const deficiencies = (meta?.deficiencies as string[]) || [];
    const items: ItemDetail[] = inspectItemData.map(({ name, label }) => ({
      name,
      label,
      checked: deficiencies.includes(name),
    }));
    return (
      <>
        <Head>
          <title>Daily Vehicle Inspection - Hooks Crane</title>
          <meta name="description" content={`daily Vehicle inspection number ${id}`} />
        </Head>

        <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24 print:text-sm">
          <div className="max-w-xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Vehicle Inspection
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                <span>
                  <DateFormat date={new Date(data.dailyInspectById.datetime)} />
                </span>
                <span className="block sm:inline sm: ml-4">
                  <TimeFormat date={new Date(data.dailyInspectById.datetime)} />
                </span>
              </p>
            </div>
            <div className="mt-12">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 print:gap-y-4 print:grid-cols-2">
                <div className="sm:col-span-2 print:col-span-2">
                  <h3 className="text-1xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    Details
                  </h3>
                </div>
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Make</dt>
                  <dd className="mt-1 text-sm text-gray-900">{craneData.make}</dd>
                </dl>
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Model</dt>
                  <dd className="mt-1 text-sm text-gray-900">{craneData.model}</dd>
                </dl>
                <dl>
                  <dt className="text-sm font-medium text-gray-500">VIN</dt>
                  <dd className="mt-1 text-sm text-gray-900">{craneData.vin}</dd>
                </dl>
                <dl>
                  <dt className="text-sm font-medium text-gray-500">Identification Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{craneData.id}</dd>
                </dl>
                <dl className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Inspection Performed By</dt>
                  <dd className="mt-1 text-sm text-gray-900">John Hooks II</dd>
                </dl>
              </div>
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
  }

  throw new Error("Not found");
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
