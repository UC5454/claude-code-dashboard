"use client";

import { useEffect, useState } from "react";
import type { Period } from "@/types";

function toPeriod(value: string | null): Period {
  if (value === "1D" || value === "7D" || value === "30D" || value === "All") return value;
  return "7D";
}

function readPeriodFromURL(): Period {
  if (typeof window === "undefined") return "7D";
  return toPeriod(new URLSearchParams(window.location.search).get("period"));
}

export function usePeriod(defaultPeriod: Period = "7D") {
  const [period, setPeriod] = useState<Period>(defaultPeriod);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setPeriod(readPeriodFromURL());
    update();

    const onPeriodChange = (event: Event) => {
      const custom = event as CustomEvent<string>;
      setPeriod(toPeriod(custom.detail ?? new URLSearchParams(window.location.search).get("period")));
    };

    window.addEventListener("popstate", update);
    window.addEventListener("periodchange", onPeriodChange);

    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("periodchange", onPeriodChange);
    };
  }, []);

  return {
    period,
    setPeriod,
    readPeriodFromURL,
  };
}
