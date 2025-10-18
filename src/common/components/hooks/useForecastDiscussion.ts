import { useEffect, useState } from "react";
import {
  getDiscussion,
  getDiscussionList,
} from "../../../modules/forecast/server/getDiscussion";
import { useQueries, useQuery } from "@tanstack/react-query";

export function useForecastDiscussion(office: string) {
  const forecastDiscussionList = useQuery(
    ["discussion-metadata", office],
    () => getDiscussionList(office),
    {
      staleTime: Infinity,
    }
  );
  const mostRecentDiscussionMetadata = forecastDiscussionList.data?.["@graph"]
    ? forecastDiscussionList.data["@graph"][0]
    : undefined;

  const [selectedId, setSelectedId] = useState(
    mostRecentDiscussionMetadata?.id
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

export type UseForecastDiscussion = ReturnType<typeof useForecastDiscussion>;
