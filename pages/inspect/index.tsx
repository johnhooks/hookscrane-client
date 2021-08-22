import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
// import { gql } from "@apollo/client";
// import { useQuery } from '@apollo/client'
import { useAllDailyInspectsQuery } from "generated/types";
import { DateFormat } from "components/date-format";

const Inspect: NextPage = () => {
  const { data, loading, error } = useAllDailyInspectsQuery();
  return (
    <div>
      <Head>
        <title>Inspections - Hooks Crane</title>
        <meta name="description" content="crane inspections" />
      </Head>
      <div>
        <h2 className="text-2xl font-bold">Inspections</h2>
        {loading && <p>loading</p>}
        {data &&
          data.allDailyInspects.map((inspect) => (
            <p key={inspect.id}>
            <DateFormat date={new Date(inspect.datetime)}/>
            <span className="ml-4">{inspect.type}</span>
            <Link href={`/inspect/${inspect.id}`} >
              view
            </Link>
            </p>
          ))}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Inspect), { ssr: false });
