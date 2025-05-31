"use client";

import dynamic from "next/dynamic";

const DynamicAntSimulation = dynamic(
  () => import("@/components/AntSimulation"),
  { loading: () => <p>Loading...</p>, ssr: false }
);

export default function Home() {
  return <DynamicAntSimulation />;
}
