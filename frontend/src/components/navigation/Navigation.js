import Image from "next/image";
import Link from "next/link";

import logo from "@/media/logo.png";

export default function Page() {
  return (
    <div className="w-screen flex justify-between bg-white px-7">
        {/* Logo */}
        <Link href="/" className="hover:cursor-pointer flex items-center">
          <Image src={logo} alt="logo" className="w-[50px] h-[50px]" />
          <p className="text-purple1 text-lg tracking-widest">ZINA</p>
        </Link>
        <div className="flex items-center">
            <a href="/" className="p-4 hover:bg-purpleLight duration-200">Home</a>
            <a href="/courses" className="p-4 hover:bg-purpleLight duration-200">Courses</a>
            <a href="/about" className="p-4 hover:bg-purpleLight duration-200">About</a>
        </div>
        <div className="flex items-center">Welcome, Noah</div>
    </div>
  );
}
