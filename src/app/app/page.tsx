"use client";
import React from 'react';
import DynamicMap from './map';
const useIsClient = () => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    const windowExists = typeof window !== 'undefined';
    if (windowExists) setIsClient(true);
  }, []);

  return isClient;
};
export default function Page() {
  const isClient = useIsClient();
  if (!isClient) {
    return null;
  }
  return <DynamicMap />;
}