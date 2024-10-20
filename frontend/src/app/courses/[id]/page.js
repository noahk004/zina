"use client";

import { useParams } from "next/navigation";

import Link from "next/link";

import Navigation from "@/components/navigation/Navigation";

export default function Page() {
  const { id } = useParams();

  return (
    <div>
      <Navigation />
      <div className="w-screen flex justify-center py-[100px]">
        <div className="rounded-lg w-[1000px] bg-white px-7 py-7">
          <h1 className="text-3xl font-bold mb-4">Course {id}</h1>

            <div>
                <div>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </div>
                <div>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </div>
            </div>
          <div className="flex gap-2 text-lg">
            <Link
              href="/courses"
              className="bg-white rounded-lg px-4 py-1 border-2 border-purpleLight hover:bg-purpleLight duration-200"
            >
              Back
            </Link>
            <Link
              href={`/courses/${id}/lobby`}
              className="bg-purple3 text-white rounded-lg px-4 py-1 hover:bg-purple1 duration-200"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
