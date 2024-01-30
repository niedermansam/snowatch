import { NavBar } from "~/common/components/NavBar";
import "~/common/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import ModalProvider from "~/common/providers/ModalProvider";
import MyQueryParamProvider from "~/common/providers/QueryParamProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { env } from "~/env.mjs";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "SnoWatch | Find your next powder day.",
  description:  "SnoWatch is here to help backcountry skiers and riders find the best snow conditions for their next adventure.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <MyQueryParamProvider>
          <TRPCReactProvider headers={headers()}>
            <NavBar />
            <main>
              {children}
              <ModalProvider />
            </main>
          </TRPCReactProvider>
        </MyQueryParamProvider>
      </body>
      {env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-VH6C7CNZTX" />}
    </html>
  );
}
