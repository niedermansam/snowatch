"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/require-await
export default function RedirectPage() {
  const router = useRouter();
  
  const geohash = "c2qft";

  useEffect(() => {
  router.push(
    `/snotel/near/${geohash}`
  );
  }, [router, geohash]);
  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  )
}