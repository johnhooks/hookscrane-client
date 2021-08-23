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
      <div className="bg-white sm:bg-gray-100 max-w-2xl mx-auto py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Recent Inspections</h2>
        </div>
        <div className="mt-4 sm:mt-6">
          {loading && <p>loading</p>}
          {data && <DailyInspectList inspects={data.allDailyInspects} />}
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Inspect), { ssr: false });
