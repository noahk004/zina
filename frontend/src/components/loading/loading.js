"use client"

import { BarLoader } from "react-spinners"

export default function LoadingPage() {
    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <BarLoader color="#EAEBED" />
        </div>
    )
}