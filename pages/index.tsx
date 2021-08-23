import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
// import Image from 'next/image'
import { gql } from "@apollo/client";
import { initializeApollo } from "lib/apollo-client";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Hooks Crane Service</title>
        <meta name="description" content="The website of Hooks Crane Service, Inc. of TriCities, WA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h1>Hooks Crane</h1>
      </div>
    </div>
  );
};

export default Home;

// export const getStaticProps: GetStaticProps = async function () {
//   const apolloClient = initializeApollo(null)

//   const { data } = await apolloClient.query<Array<Item>>({
//     query: gql`
//       query allItems {
//         allItems {
//           id
//         }
//       }
//     `,
//   });

//   console.log(data)

//   return {
//     props: {
//       initialApolloState: apolloClient.cache.extract()
//     },
//  };
// }
