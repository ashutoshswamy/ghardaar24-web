"use client";

import { Toaster as SileoToaster } from "sileo";
import "sileo/styles.css";

export function Toaster() {
  return (
    <SileoToaster
      position="top-center"
      offset={{ top: 16 }}
      theme="light"
      options={{ fill: "#1c1917", roundness: 16 }}
    />
  );
}
