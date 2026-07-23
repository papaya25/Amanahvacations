"use client";

/* Explicit-save persistence for the admin editors, backed by the database
   (replaced the old localStorage-based useLocalState). Exposes
   value/setValue/save/loaded/savedAt plus saving/error so editors can show real
   save status. On mount it loads the section's saved data via a server action
   (service_role, secure); Save writes it back and the public site refreshes
   automatically. */

import { useCallback, useEffect, useState } from "react";
import { loadContent, saveContent } from "@/lib/content/actions";

export function useDbState<T>(key: string, initial: T) {
  const dbKey = key.replace(/^admin_/, ""); // "admin_hero" -> "hero"
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await loadContent<Partial<T>>(dbKey);
      if (alive && data) setValue((prev) => ({ ...prev, ...data }) as T);
      if (alive) setLoaded(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbKey]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    const res = await saveContent(dbKey, value);
    setSaving(false);
    if (res.ok) setSavedAt(Date.now());
    else setError(res.error || "Could not save. Please try again.");
  }, [dbKey, value]);

  return { value, setValue, save, loaded, savedAt, saving, error };
}
