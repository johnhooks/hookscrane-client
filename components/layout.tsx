import type { FunctionComponent } from "react";
import Head from "next/head";

import { NavigationBar } from "components/navigation/bar";

const Layout: FunctionComponent = function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Hooks Crane Service</title>
        <meta name="description" content="The website of Hooks Crane Service Tri-Cities, WA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavigationBar />
      <main>{children}</main>

      {/* <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96" />
          </div>

        </div>
      </main> */}
    </>
  );
};

export default Layout;
