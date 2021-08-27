import type { NextPage } from "next";
import type { GetServerSideProps } from "next";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";

import { fetchAccessToken } from "lib/fetch-access-token";
import { initializeApollo, addApolloState } from "lib/apollo-client";
import { serverSideRedirect } from "lib/server-side-redirect";
import { MeQuery, MeDocument } from "generated/types";
import { useAuth } from "contexts/auth-context";

const MePage: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { loading, error, data } = useQuery(MeDocument);

  // Initially there is no user because that has to be populated in the client.
  if (typeof window !== "undefined") {
    if (!user) {
      router.push("/login");
      return <p>Redirecting...</p>;
    }
  } else {
    // SSR and no user has been set
    // I would prefer to just cancel render, but I haven't figured that out yet.
    if (!user) {
      return <></>;
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{`Error! ${error.message}`}</div>;

  return (
    <>
      <div>
        <Link href="/">Home</Link>
      </div>
      {user && <div>Hello, you are logged in as {data.me.email}</div>}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const accessToken = await fetchAccessToken(ctx);
  const apolloClient = initializeApollo(null, accessToken);

  if (!accessToken) return serverSideRedirect(ctx, "/login");

  const { data } = await apolloClient.query<MeQuery>({
    query: MeDocument,
  });

  if (!data?.me) {
    ctx.res.statusCode = 500;
    throw new Error(`User data request failed`);
  }

  return addApolloState(apolloClient);
};

export default MePage;
