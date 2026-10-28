import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { listCellars, listWines, type Cellar, type Wine } from '@/lib/api';
import { findDefaultCellar } from '@/lib/cellars';
import { getErrorMessage } from '@/lib/errors';

/**
 * Loads the default cellar and its wines every time the screen gains focus.
 *
 * This refreshes the list when coming back from `/add-wine` without
 * duplicating the loading logic in the screen.
 */
export function useCellarWines(enabled: boolean) {
  const [cellar, setCellar] = useState<Cellar | null>(null);
  const [wines, setWines] = useState<Wine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cellars = await listCellars();
      const defaultCellar = findDefaultCellar(cellars);

      if (!defaultCellar) {
        setCellar(null);
        setWines([]);
        setError('No hay una bodega para este usuario');
        return;
      }

      setCellar(defaultCellar);
      setWines(await listWines(defaultCellar.id));
      setError(null);
    } catch (cause) {
      setError(getErrorMessage(cause, 'No se pudieron cargar los vinos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        void load();
      }
    }, [enabled, load]),
  );

  return { cellar, wines, error, loading };
}
