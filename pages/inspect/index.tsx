import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
// import { gql } from "@apollo/client";
// import { useQuery } from '@apollo/client'
import { useAllDailyInspectsQuery } from "generated/types";
import { DailyInspectList } from "components/daily-inspect/list";

const Inspect: NextPage = () => {
  const { data, loading, error } = useAllDailyInspectsQuery();
  return (
    <div>
      <Head>
        <title>Inspections - Hooks Crane</title>
        <meta name="description" content="List of recent inspections" />
      </Head>
      <header className="bg-white sm:shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Recent Inspections</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href="/inspect/crane/new" passHref>
                <a
                  role="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Inspect Crane
                </a>
              </Link>
              <Link href="/inspect/vehicle/new" passHref>
                <a
                  role="button"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Inspect Vehicle
                </a>
              </Link>
              {/* <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </button> */}
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto">
        <div className="sm:px-6 lg:px-8">
          {/* <div className="text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Recent Inspections</h2>
          </div> */}
          <div className="mt-4 sm:mt-6">
            {loading && <p>loading</p>}
            {data && <DailyInspectList inspects={data.allDailyInspects} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Inspect), { ssr: false });
