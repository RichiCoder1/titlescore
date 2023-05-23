import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl"
          >
            TitleScore
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-white">
            Get started making competition scoring quick, reliable, and seamless.
            Either enter manually or add your judges to get scores in realtime.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/auth/login"
              className="rounded-md bg-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
              >Get started</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
