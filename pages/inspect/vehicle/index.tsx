import type { NextPage } from "next";
import type { GetServerSideProps } from "next";

import Head from "next/head";
import Link from "next/link";

import { initializeApollo, addApolloState } from "lib/apollo-client";
import {
  useRecentDailyVehicleInspectsQuery,
  RecentDailyVehicleInspectsQuery,
  RecentDailyVehicleInspectsDocument,
} from "generated/types";
import { DailyInspectList } from "components/daily-inspect/list";

const DailyVehicleInspects: NextPage = () => {
  const { data, loading, error } = useRecentDailyVehicleInspectsQuery();
  return (
    <div>
      <Head>
        <title>Recent Daily Vehicle Inspections - Hooks Crane</title>
        <meta name="description" content="List of recent inspections" />
      </Head>
      <header className="bg-white sm:shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Recent Daily Vehicle Inspections
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href="/inspect/vehicle/new" passHref>
                <a
                  role="button"
                  className=" inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Inspect Vehicle
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto">
        <div className="sm:px-6 lg:px-8">
          <div className="mt-4 sm:mt-6">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && <DailyInspectList inspects={data.recentDailyVehicleInspects} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const apolloClient = initializeApollo(null);

  await apolloClient.query<RecentDailyVehicleInspectsQuery>({
    query: RecentDailyVehicleInspectsDocument,
  });

  return addApolloState(apolloClient);
};

export default DailyVehicleInspects;
