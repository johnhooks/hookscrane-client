import type { FunctionComponent } from "react";
import Head from "next/head";
import Link from "next/link";

import { NavigationBar, Navigation } from "components/navigation/bar";

const navigation: Record<string, Navigation[]> = {
  main: [
    {
      name: "Inspections",
      href: "/inspect",
      // icon: props => <ClipboardCheckIcon {...props} /> // Error: Component definition is missing display name  react/display-name
    },
  ],
};

const Layout: FunctionComponent = function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Hooks Crane Service</title>
        <meta name="description" content="The website of Hooks Crane Service Tri-Cities, WA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavigationBar navigation={navigation.main} />
      <main>{children}</main>
      <footer>
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center print:hidden" aria-label="Footer">
            {navigation.main.map(item => (
              <div key={item.name} className="px-5 py-2">
                <Link href={item.href} passHref>
                  <a className="text-base text-gray-500 hover:text-gray-900">{item.name}</a>
                </Link>
              </div>
            ))}
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2021 Hooks Crane Service, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Layout;
