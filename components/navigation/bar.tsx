import type { FunctionComponent } from "react";
import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";

import { useAuth } from "contexts/auth-context";

const userNavigation = [
  { name: "Your Profile", href: "/me" },
  // { name: "Settings", href: "/account/settings" },
  { name: "Logout", href: "/logout" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const NavigationBar: FunctionComponent = function NavigationBar() {
  const { pathname } = useRouter();
  const { user } = useAuth();

  const navigation = [
    { name: "Inspect", href: "/inspect" },
    { name: "Log", href: "/log", current: false },
  ].map(item => {
    if (new RegExp(`^${item.href}$`).test(pathname)) {
      return { ...item, current: true };
    } else {
      return { ...item, current: false };
    }
  });

  return (
    <div>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-gray-300">HCS</div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {navigation.map(item => (
                        <Link href={item.href} passHref key={item.name}>
                          <a
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    {/* Profile dropdown */}

                    {!user && (
                      <Link href="/login" passHref>
                        <a className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                          Login
                        </a>
                      </Link>
                    )}
                    {user && (
                      <Menu as="div" className="ml-3 relative">
                        <div>
                          <Menu.Button className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="sr-only">Open user menu</span>
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
                              <span className="text-sm font-medium leading-none text-white">JH</span>
                            </span>
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map(item => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link href={item.href} passHref>
                                    <a
                                      href={item.href}
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block px-4 py-2 text-sm text-gray-700"
                                      )}
                                    >
                                      {item.name}
                                    </a>
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    )}
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}

            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map(item => (
                  <Link key={item.name} href={item.href} passHref>
                    <a
                      className={classNames(
                        item.current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>

              {!user && (
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="px-2 space-y-1">
                    <Link href="/login" passHref>
                      <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                        Login
                      </a>
                    </Link>
                  </div>
                </div>
              )}

              {/* Mobile Profile menu */}

              {user && (
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                        <span className="font-medium leading-none text-white">JH</span>
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    {userNavigation.map(item => (
                      <Link key={item.name} href={item.href} passHref>
                        <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                          {item.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};
