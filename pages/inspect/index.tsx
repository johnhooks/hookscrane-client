import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
// import { gql } from "@apollo/client";
// import { useQuery } from '@apollo/client'
import { useAllDailyInspectsQuery } from "generated/types";
import { DateFormat } from "components/date-format";

const Inspect: NextPage = () => {
  const { data, loading, error } = useAllDailyInspectsQuery();

  if (!loading) {
    console.log(data);
  }

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
            </p>
          ))}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Inspect), { ssr: false });
