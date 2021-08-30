import type { FunctionComponent } from "react";
import Head from "next/head";
import { ClipboardCheckIcon } from "@heroicons/react/outline";
import { NavigationBar, Navigation } from "components/navigation/bar";

const navigation: Record<string, Navigation[]> = {
  main: [{ name: "Inspections", href: "/inspect", icon: props => <ClipboardCheckIcon {...props} /> }],
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
                <a href={item.href} className="text-base text-gray-500 hover:text-gray-900">
                  {item.name}
                </a>
              </div>
            ))}
          </nav>
          {/* <div className="mt-8 flex justify-center space-x-6">
            {navigation.social.map(item => (
              <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div> */}
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2021 Hooks Crane Service, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Layout;
