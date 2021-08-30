import type { NextPage } from "next";
import type { GetServerSideProps } from "next";

import Head from "next/head";
import Link from "next/link";

import { initializeApollo, addApolloState } from "lib/apollo-client";

import {
  DocType,
  RecentDocumentsListDocument,
  RecentDocumentsListQuery,
  useRecentDocumentsListQuery,
} from "generated/types";
import { Page } from "components/page";
import { ListDocuments } from "components/document/list";

const title = "Recent Inspections";
const actions = [
  { href: "/inspect/vehicle/new", label: "Inspect Vehicle" },
  { href: "/inspect/crane/new", label: "Inspect Crane" },
];
const variables = { types: [DocType.InspectVehicleDaily, DocType.InspectCraneFrequent] };
const description = "List of recent inspections";

const ListInspectsPage: NextPage = () => {
  const { data, loading, error } = useRecentDocumentsListQuery({
    variables,
  });

  const documents = data?.recentDocuments.map(doc => ({ ...doc, datetime: new Date(doc.datetime) }));

  return (
    <>
      <Head>
        <title>{title} - Hooks Crane</title>
        <meta name="description" content={description} />
      </Head>
      <Page title={title} actions={actions}>
        <div className="max-w-2xl mx-auto mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8">
          {loading && <p>loading</p>}
          {error && <p>Error: {error.message}</p>}
          {documents && <ListDocuments documents={documents} />}
        </div>
      </Page>
    </>
  );
};

export default ListInspectsPage;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const apolloClient = initializeApollo(null);

  await apolloClient.query<RecentDocumentsListQuery>({
    query: RecentDocumentsListDocument,
    variables,
  });

  return addApolloState(apolloClient);
};
