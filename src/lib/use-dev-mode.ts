"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readDevMode, subscribeDevMode, writeDevMode } from "@/lib/dev-mode";

export function useDevMode() {
  const on = useSyncExternalStore(subscribeDevMode, readDevMode, () => false);

  const setDevMode = useCallback((next: boolean) => {
    writeDevMode(next);
  }, []);

  const toggle = useCallback(() => {
    writeDevMode(!readDevMode());
  }, []);

  return { on, setDevMode, toggle };
}
