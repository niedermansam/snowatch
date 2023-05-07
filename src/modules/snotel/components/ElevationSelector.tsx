"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ElevationSelector ({geohash}: {geohash: string}) {
    const router = useRouter();

    const searchParams = useSearchParams();


    const [elevation, setElevation] = useState(searchParams?.get("elev") || 0);

    function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        router.push(
            `/snotel/near/${geohash}?elev=${elevation}`
        )
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if(e.target.value === "") return setElevation(0)
        setElevation(parseInt(e.target.value));
    }


    return (
        <form>
        <label htmlFor="elevation">Elevation</label>
        <input type="text" pattern="\d*" value={elevation} onChange={handleChange} />
        <button onClick={handleClick}>Filter</button>
        </form>
    )
}