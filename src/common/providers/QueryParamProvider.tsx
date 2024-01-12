// app/layout.tsx

"use client";

import NextAdapterApp from "next-query-params/app";
import { QueryParamProvider } from "use-query-params";

export default function MyQueryParamProvider({ children }:{
    children: React.ReactNode
}) {
  return (
        <QueryParamProvider adapter={NextAdapterApp}>
          {children}
        </QueryParamProvider>
  );
}
