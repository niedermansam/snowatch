"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type DiscussionItemMeta = {
  "@id": string;
  id: string;
  wmoCollectiveId: string;
  issuingOffice: string;
  issuanceTime: string;
  productCode: string;
  productName: string;
};

type DiscussionList = {
  "@graph": DiscussionItemMeta[];
};

export type DiscussionItem = {
  url: string;
  id: string;
  office: string;
  date: string;
};

type ForecastDiscussion = {
  id: string;
  "@id": string;
  issuanceTime: string;
  productCode: string;
  productName: string;
  productText: string;
};


async function getDiscussionList(station: string) {
  try {
    const res = await fetch(
      "https://api.weather.gov/products/types/AFD/locations/" + station,
      {
        next: {
          revalidate: 60 * 5,
        },
        headers: {
          
        },
      },
    );

    return (await res.json()) as DiscussionList;
  } catch (error) {
    console.error(error);
  }
}
async function getDiscussion(url: string) {
  const res = await fetch(url, {
    cache: "force-cache",
  });
  const data = (await res.json()) as unknown;

  return data as ForecastDiscussion;
}

export function useForecastDiscussion(office: string | undefined) {
  const forecastDiscussionList = useQuery(
    {
      queryKey: ["forecast-discussion-list", office],
      queryFn: () => getDiscussionList(office!),
      enabled: !!office,
      staleTime: Infinity,
    }

  );
  const mostRecentDiscussionMetadata = forecastDiscussionList.data?.["@graph"]
    ? forecastDiscussionList.data["@graph"][0]
    : undefined;

  const [selectedId, setSelectedId] = useState(
    mostRecentDiscussionMetadata?.id,
  );

  useEffect(() => {
    setSelectedId(mostRecentDiscussionMetadata?.id);
  }, [mostRecentDiscussionMetadata]);

  const discussions = useQueries({
    queries: forecastDiscussionList.data
      ? forecastDiscussionList.data["@graph"].map((x) => ({
          queryKey: ["discussion", x.id],
          queryFn: () => getDiscussion(x["@id"]),
          enabled: selectedId == x.id,
          staleTime: Infinity,
        }))
      : [],
  });

  return {
    metadata: forecastDiscussionList.data?.["@graph"].map((x) => ({
      ...x,
      url: x["@id"],
      selected: false,
    })),
    discussions,
    selectedId,
    setSelectedId,
  };
}
