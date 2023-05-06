"use client";
import Link from "next/link";
import { useState } from "react";

export function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
  return (
      <nav className="flex flex-wrap items-center justify-between bg-gradient-to-r from-[#2e026d] to-[#15162c] p-6">
        <div className="mr-6 flex flex-shrink-0 items-center text-white">
          <Link href="/"><span className="text-xl font-semibold tracking-tight">SnoWatch</span></Link>


        </div>

        <div className="block lg:hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
                <svg
                    className="fill-current h-3 w-3"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <title>Menu</title>
                    <path
                        d="M0 0h20v20H0V0zm2 9h16v2H2V9zm0-5h16v2H2V4zm0 10h16v2H2v-2z"
                        fillRule="evenodd"
                    />
                </svg>
            </button>
            </div>

            <div 
                className=
                {`  w-full flex-grow lg:flex lg:items-center lg:w-auto ${isOpen ? "block" : "hidden"} `}
                id="nav-content"

            >
                <div className="text-sm lg:flex-grow">
                    <Link href="/about"><span className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">About</span></Link>
                    <Link href="/contact"><span className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Contact</span></Link>
                    <Link href="/login"><span className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Login</span></Link>
                </div>
            </div>
      </nav>
  );
}
