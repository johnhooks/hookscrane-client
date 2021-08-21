import type { FunctionComponent } from "react";
import Head from "next/head";

const Layout: FunctionComponent = function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Hooks Crane Service</title>
        <meta name="description" content="The website of Hooks Crane Service Tri-Cities, WA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{children}</main>
    </>
  );
};

export default Layout;
