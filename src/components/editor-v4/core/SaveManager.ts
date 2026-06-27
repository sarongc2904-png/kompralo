'use client';

import { useCallback, useState } from 'react';

export interface SaveResult {
  success: boolean;
  error?: string;
}

/**
 * Centralised save state hook.
 * Each inspector calls `save(key, action, onSaved?)` — no duplicated
 * setSaving/setError boilerplate across inspector components.
 */
export function useSaveManager() {
  const [saving, setSaving]   = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const save = useCallback(async (
    key: string,
    action: () => Promise<SaveResult>,
    onSuccess?: () => void,
  ) => {
    setSaving(true);
    setSavedKey(null);
    setError(null);
    try {
      const result = await action();
      if (result.success) {
        setSavedKey(key);
        onSuccess?.();
      } else {
        setError(result.error ?? 'Error al guardar');
      }
    } catch {
      setError('Error de red al guardar');
    } finally {
      setSaving(false);
    }
  }, []);

  const clearStatus = useCallback(() => {
    setSavedKey(null);
    setError(null);
  }, []);

  return { saving, savedKey, error, save, clearStatus };
}
