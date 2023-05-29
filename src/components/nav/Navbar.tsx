import { NavLink, useNavigation } from "react-router-dom";
import { Disclosure, Transition } from "@headlessui/react";
import { XIcon, MenuIcon } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from "@clerk/clerk-react";
import { cn } from "~/utils/styles";
import { useEffect, useState } from "react";
import { ContestCombobox } from "./ContestCombobox";
import { ScaleLoader } from "react-spinners";
import { useIsFetching } from "@tanstack/react-query";
import { trpc } from "~/utils/trpc";

type Link = { name: string; to: string };

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { state } = useNavigation();
  const isQueryLoading = useIsFetching();
  const utils = trpc.useContext();

  const [navigationLinks, setNavigationLinks] = useState<Link[]>([]);
  useEffect(() => {
    setNavigationLinks(isSignedIn ? [{ name: "Dashboard", to: "/app" }] : []);
  }, [isSignedIn]);

  const isLoading = state === "loading" || isQueryLoading > 0;

  useEffect(() => {
    if (!isSignedIn) {
      utils.invalidate();
    }
  }, [isSignedIn, utils]);

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0">
                  <NavLink to={isSignedIn ? "/app" : "/"}>
                    <img
                      className="h-8 w-8"
                      src="/favicon.svg"
                      alt="TitleScore"
                    />
                  </NavLink>
                </div>{" "}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <SignedIn>
                      <ContestCombobox />
                    </SignedIn>
                    {navigationLinks.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            isActive
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="mr-6 flex items-center justify-end md:ml-6 md:mr-0">
                  <Transition
                    show={isLoading}
                    enter="transition-opacity duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <ScaleLoader
                      className="mr-4"
                      loading={true}
                      color="hsl(var(--primary))"
                    />
                  </Transition>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton />
                  </SignedOut>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
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

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigationLinks.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={NavLink}
                  to={item.to}
                  className={({ isActive }: { isActive: boolean }) =>
                    cn(
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )
                  }
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
