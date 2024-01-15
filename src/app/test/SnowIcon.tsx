import React from "react";
import smallIcon from "public/snowflake64.png";
import largeIcon from "public/snowflake500.png";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

export const SnowIcon = ({
  size = "sm",
  className,
  loading = false,
}: {
  size?: "sm" | "lg";
  className?: string;
  loading?: boolean;
}) => {
  if (size === "lg") {
    return (
      <Image
        src={largeIcon}
        className={twMerge(
          `size-32 drop-shadow`,
          loading && "animate-pulse",
          className
        )}
        alt="snowflake"
      />
    );
  }

  return (
    <Image
      src={smallIcon}
      className={twMerge(
        `size-5 drop-shadow`,
        loading && "animate-pulse",
        className
      )}
      alt="snowflake"
    />
  );
};
