import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Hooks Crane Service</title>
        <meta name="description" content="The website of Hooks Crane Service, Inc. of TriCities, WA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative bg-white overflow-hidden">
        <main className="mt-10 mx-auto max-w-6xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
          <div className="sm:text-center lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Hooks Crane</span>{" "}
              <span className="block text-indigo-600 xl:inline">Records &amp; Inspections</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Detailed record keeping helps ensure safety and functionality of equipment.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;
