"use client";
import React from "react";
import {
  UseForecastDiscussion,
  useForecastDiscussion,
} from "../hooks/useForecastDiscussion";
import { DiscussionCombobox } from "../../map/DiscussionCombobox";
import { Button } from "@/components/ui/button";
import { SnowIcon } from "~/app/test/SnowIcon";

export function ForecastDiscussionSection({ office }: { office: string }) {
  const discussion = useForecastDiscussion(office);
  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      <ForecastDiscussionText
        text={
          discussion.discussions.filter(
            (x) => x.data?.id === discussion.selectedId
          )[0]?.data?.productText
        }
      >
        <ForecastDiscussionSelector data={discussion} />
      </ForecastDiscussionText>
    </div>
  );
}
function ForecastDiscussionSelector({ data }: { data: UseForecastDiscussion }) {
  const currentIndex = data.metadata?.findIndex(
    (x) => x.id === data.selectedId
  );

  const goToNext = () => {
    if (currentIndex === undefined) return;
    if (currentIndex === 0) return;
    data.setSelectedId(data.metadata?.[currentIndex - 1]?.id);
  };

  const goToPrevious = () => {
    if (currentIndex === undefined) return;
    if (!data.metadata) return;
    if (currentIndex === data.metadata.length - 1) return;
    data.setSelectedId(data.metadata?.[currentIndex + 1]?.id);
  };

  return (
    <div className="flex flex-col gap-2 pb-4">
      <h3 className="col-span-2 text-lg font-bold">Forecast Discussion</h3>
      <div className="col-span-2">
        <DiscussionCombobox
          value={data.selectedId}
          setValue={data.setSelectedId}
          options={data.metadata}
        />
      </div>
      {/* <div className="flex gap-4">
        <Button
          variant="secondary"
          className="w-24 "
          onClick={goToPrevious}
          disabled={
            currentIndex === undefined ||
            !data.metadata ||
            currentIndex === data.metadata.length - 1
          }
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          className="w-24 "
          onClick={goToNext}
          disabled={currentIndex === undefined || currentIndex === 0}
        >
          Next
        </Button>
      </div> */}
    </div>
  );
}
function ForecastDiscussionText({
  text,
  children,
}: {
  text: string | undefined;
  children?: React.ReactNode;
}) {
  // const [meta, discussion] = text?.split(".DISCUSSION") || ["", ""];
  // const [_, _2, warnings] = meta?.split("\n\n") || ["", ""];
  // console.log(warnings);
  // console.log(discussion)
  if (text === undefined)
    return (
      <div className="flex animate-pulse flex-col items-center justify-center  pt-24  font-black text-slate-500">
        <SnowIcon size="lg" className=" grayscale-[.4]" />
        <p className="text-6xl">Loading</p>
        <p className="text-3xl font-normal tracking-tighter">
          Forecast Discussion
        </p>
      </div>
    );

  const captureDiscussionSections = /(\.([A-Z|\/]+ ?)+\.\.\.)/g;

  const headers = text?.match(captureDiscussionSections);

  function getDiscussionSection(header: string) {
    const start = text?.indexOf(header);

    if (start === undefined) {
      const beforeHeader = text?.slice(0, text?.indexOf(header));
      return beforeHeader;
    }
    const end = text?.indexOf(header, start + 1);
    return text?.slice(start, end);
  }

  const sections = headers?.map((header) => ({
    header,
    text: getDiscussionSection(header),
  }));
  // console.log(sections)

  const preamble = text?.slice(0, text?.indexOf(sections?.[0]?.header || ""));

  // console.log(preamble)

  return (
    <div
      className="max-w-xl"
      style={{
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
      <p className="col-span-2 text-sm ">
        {text
          ?.replace(preamble || "", "")
          .replaceAll(/(^|\n)(?!\n)/g, " ")
          .replaceAll(/\n+/g, "\n\n")
          .replaceAll(/ +/g, " ")
          .replaceAll(/\n /g, "\n")}
      </p>
    </div>
  );
}
