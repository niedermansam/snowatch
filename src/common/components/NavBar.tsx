"use client";
import Link from "next/link";
import { useState } from "react";

export const DESKTOP_NAVBAR_HEIGHT = 50;

export function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
  return (
      <nav className="flex flex-wrap items-center justify-between bg-gradient-to-r  from-sw-indigo-700 to-sw-indigo-900 px-6 py-3 " style={{
            height: DESKTOP_NAVBAR_HEIGHT,
        zIndex: 2000,
        position: 'relative'
      }}
      >
        <div className="mr-6 flex flex-shrink-0 items-center text-white">
          <Link href="/"><span className="text-xl font-semibold tracking-tight">SnoWatch</span></Link>


        </div>

        <div className="block lg:hidden">
            {false &&<button 
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
            </button>} 
            </div>

          {false &&  <div 
                className=
                {`  w-full flex-grow lg:flex lg:items-center lg:w-auto ${isOpen ? "block" : "hidden"} `}
                id="nav-content"

            >
                <div className="text-sm lg:flex-grow">
                    <Link href="/at"><span className="block mt-2 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Forecast</span></Link>
                    <Link href="/snotel"><span className="block mt-2 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Snotel</span></Link>
                </div>
            </div>}
      </nav>
  );
}
