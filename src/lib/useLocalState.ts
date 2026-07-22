"use client";

/* Explicit-save local persistence for the admin editors (flow-first). Edits
   stay in working state until Save writes them to localStorage. When the
   backend lands, `load`/`save` become API calls and nothing else changes. */

import { useCallback, useEffect, useState } from "react";

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue({ ...initial, ...JSON.parse(raw) } as T);
    } catch {
      /* ignore malformed */
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setSavedAt(Date.now());
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);

  return { value, setValue, save, loaded, savedAt };
}
