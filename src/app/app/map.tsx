"use client";
import dynamic from "next/dynamic"; 
import React from "react";

const DynamicMap = dynamic(() => import("../../common/components/map/MainMap"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});





export default function Home() {  

  return (
    <>
      <div className="w-full" style={{ height: "calc(100vh - 29px)" }}>
        <DynamicMap />
      </div>
    </>
  );
}
