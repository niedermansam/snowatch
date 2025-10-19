"use client";
import React from "react";
import { useForecastDiscussion } from "~/common/components/hooks/noaa/useForecastDiscussion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"; 
import Snowflake from "~/common/snowflake";
import { Button } from "~/components/ui/button";

// {
//     "productCode": "RSD",
//     "productName": "Daily Snotel Data"
//   },
//   {
//     "productCode": "RSM",
//     "productName": "Monthly Snotel Data"
//   },

const formatDisccussionTime = (time: string | undefined) => {
  if (!time) return "Select a discussion";
  const date = new Date(time);
  const dateString = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    weekday: "long",
  });
  const timeString = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "numeric",
  });

  return `${timeString}  ${dateString}`;
};

export const DiscussionSection = ({
  office,
}: {
  office: string | undefined;
}) => {
  const data = useForecastDiscussion(office);


 if(data.discussionList.isLoading) {
    return <div className="mt-6 h-full flex justify-center items-center"> 
      <div className="flex flex-col items-center space-x-2  ">
        <div className="size-48 animate-spin-slow">
          <Snowflake color="#6499ce" className="animate-pulse" />
        </div>
        <div>Loading discussions...</div>
      </div>
    </div>;
  }

  if(data.discussionList.isError) {
    return <div className="mt-6 h-full flex justify-center items-center"> 
      <div className="flex flex-col items-center space-x-2  ">
        <div className="size-48 ">
          <Snowflake color="#ff0000" />
        </div>
        <div>Error loading discussion list.</div>
        <Button
          variant="secondary"
          onClick={  () => {
              data.discussionList.refetch().catch(() => {
                console.error("Error refetching discussion list");
              }); 
          }}
        >
          Retry
        </Button>
      </div>
    </div>;
  }


  return (
    <div className="mt-6"> 
      <Select
        onValueChange={(value) => {
          data.setSelectedId(value);
        }}
        defaultValue={data.selectedId}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={formatDisccussionTime(
              data.discussions.find((x) => x.data?.id === data.selectedId)?.data
                ?.issuanceTime
            )}
          />
        </SelectTrigger>
        <SelectContent className="z-[12000]">
          {data.metadata?.map((discussion) => (
            <SelectItem key={discussion.id} value={discussion.id}>
              {formatDisccussionTime(discussion.issuanceTime)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <CurrentDiscussion
        selectedId={data.selectedId}
        discussions={data.discussions}
      />
    </div>
  );
};
const CurrentDiscussion = ({
  selectedId,
  discussions,
}: {
  selectedId: string | undefined;
  discussions: ReturnType<typeof useForecastDiscussion>["discussions"];
}) => {
  const currentDiscussion = discussions.find((x) => x.data?.id === selectedId);

  if (currentDiscussion?.isLoading) {
    return <div className="mt-6 h-full flex justify-center items-center"> 
      <div className="flex flex-col items-center space-x-2  ">
        <div className="size-48 animate-spin-slow">
          <Snowflake color="#6499ce" className="animate-pulse" />
        </div>
        <div>Loading discussion...</div>
      </div>
    </div>;
  }

  if (currentDiscussion?.isError) {
    return <div className="mt-6 h-full flex justify-center items-center"> 
      <div className="flex flex-col items-center space-x-2  ">
        <div className="size-48 ">
          <Snowflake color="#ff0000" />
        </div>
        <div>Error loading discussion.</div>
        <Button
          variant="secondary"
          onClick={  () => {
              currentDiscussion.refetch().catch(() => {
                console.error("Error refetching discussion");
              }); 
          }}
        >
          Retry
        </Button>
      </div>
    </div>;
  }

  return (
    <div className="space-y-4 px-4 pb-12">
      <div className="whitespace-pre-line text-sm">
        {currentDiscussion?.isLoading && "Loading..."}
        {currentDiscussion?.isError && "Error loading discussion"}
        {currentDiscussion?.data?.productText}
      </div>
    </div>
  );
};
