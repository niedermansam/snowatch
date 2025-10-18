"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem } from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

function displayDate(date: string | undefined) {
  if (!date) return "Loading...";
    
  const foo = new Date(date);

 
   const displayDate = foo.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    weekday: "long",
  });

 
  return displayDate === "Invalid Date" ? date : displayDate.replace(",", "");
}

export function DiscussionCombobox({
  value,
  setValue,
  options,
}: {
  value: string | undefined;
  setValue: (value: string) => void;
  options:
    | {
        id: string;
        issuanceTime: string;
      }[]
    | undefined;
}) {
  const [open, setOpen] = React.useState(false);

  if (!options) return null;

  const values = options.map((discussion) => ({
    id: discussion.id,
    label: displayDate(discussion.issuanceTime),
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="sm:w-[250px] justify-between"
        >
          {value ? values.find((x) => x.id === value)?.label : "Loading..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[10000] sm:w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Select issuance date..." />
          <CommandEmpty>No discussion found</CommandEmpty>
          <CommandGroup>
            {values.map((discussion) => {
              return (
                <CommandItem
                  key={discussion.id}
                  value={discussion.label}
                  onSelect={(currentValue) => {
                    const currentId = values.find(
                      (x) => x.label.toLowerCase() === currentValue
                    )?.id;
                    setValue(currentId || "");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === discussion.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {displayDate(discussion.label) }
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
