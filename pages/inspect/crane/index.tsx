import type { NextPage } from "next";
import type { GetServerSideProps } from "next";

import Head from "next/head";
import { sortBy, reverse } from "lodash-es";

import { initializeApollo, addApolloState } from "lib/apollo-client";
import { fetchAccessToken } from "lib/fetch-access-token";
import { useAuth } from "contexts/auth-context";
import {
  DocType,
  RecentDocumentsListDocument,
  RecentDocumentsListQuery,
  useRecentDocumentsListQuery,
} from "generated/types";
import { Page } from "components/page";
import { ListDocuments } from "components/document/list";

const title = "Recent Frequent Crane Inspections";
const actions = [{ href: "/inspect/crane/new", label: "Inspect Crane", primary: true }];
const variables = { types: [DocType.InspectCraneFrequent] };
const description = "List of recent frequent crane inspections";

const FrequentInspectsPage: NextPage = () => {
  const { user } = useAuth();
  const { data, loading, error } = useRecentDocumentsListQuery({
    variables,
  });

  const documents =
    data &&
    reverse(
      sortBy(
        data.recentDocuments.map(doc => ({ ...doc, datetime: new Date(doc.datetime) })),
        ({ datetime }) => datetime
      )
    );

  return (
    <>
      <Head>
        <title>{title} - Hooks Crane</title>
        <meta name="description" content={description} />
      </Head>
      <Page title={title} actions={user ? actions : null}>
        <div className="max-w-2xl mx-auto mt-4 sm:mt-6 px-4 sm:px-6 lg:px-8">
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {documents && <ListDocuments documents={documents} />}
        </div>
      </Page>
    </>
  );
};

export default FrequentInspectsPage;

export const getServerSideProps: GetServerSideProps = async ctx => {
  const accessToken = await fetchAccessToken(ctx);
  const apolloClient = initializeApollo(null, accessToken);

  await apolloClient.query<RecentDocumentsListQuery>({
    query: RecentDocumentsListDocument,
    variables,
  });

  return addApolloState(apolloClient);
};
