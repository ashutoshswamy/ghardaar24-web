"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// New page = top of page. html has scroll-behavior: smooth, so jump instantly.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return; // let in-page anchors do their thing
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }, [pathname]);

  return null;
}
