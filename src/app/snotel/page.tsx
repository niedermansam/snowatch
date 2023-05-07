"use client";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function RedirectPage() {
  const router = useRouter();
  
  const geohash = "c2qft";

  router.push(
    `/snotel/near/${geohash}`
  );

  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  )
}