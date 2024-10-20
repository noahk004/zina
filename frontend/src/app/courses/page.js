import Navigation from "@/components/navigation/Navigation"

import Link from "next/link"
import { PlusIcon } from "@radix-ui/react-icons"

export default function Page() {
    return (
        <div>
            <Navigation />
            <div className="mt-[100px] mx-[150px]">
                <div className="flex justify-between">
                <h2 className="font-semibold text-3xl text-white">Active Courses</h2>
                <Link href="/courses/create" className="flex items-center text-purple2 gap-1 rounded-full bg-white px-4 py-2 hover:bg-purpleLight duration-200">
                    <PlusIcon className="w-6 h-6" />
                    <span className="font-medium text-lg">New Course</span>
                </Link>
                </div>
            </div>

        </div>
    )
}