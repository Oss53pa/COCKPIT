/**
 * Middleware Zustand pour le développement
 * Configure devtools pour tous les stores
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { devtools } from 'zustand/middleware';

type DevtoolsOptions = {
  name?: string;
  enabled?: boolean;
};

/**
 * Wrapper pour créer un store avec devtools en développement
 */
export const withDevtools = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  fn: StateCreator<T, Mps, Mcs>,
  options: DevtoolsOptions = {}
): StateCreator<T, Mps, [['zustand/devtools', never], ...Mcs]> => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return devtools(fn, {
      name: options.name || 'CockpitStore',
      enabled: options.enabled ?? true,
    });
  }

  // En production, retourner le store sans devtools
  return fn as StateCreator<T, Mps, [['zustand/devtools', never], ...Mcs]>;
};

/**
 * Logger middleware pour le debugging
 */
export const logger = <T extends object>(
  fn: StateCreator<T>,
  storeName: string
): StateCreator<T> => {
  return (set, get, api) => {
    const loggedSet: typeof set = (...args) => {
      const prevState = get();
      (set as (...args: unknown[]) => void)(...args);
      const nextState = get();

      if (process.env.NODE_ENV === 'development') {
        console.group(`[${storeName}] State update`);
        console.log('Previous:', prevState);
        console.log('Next:', nextState);
        console.groupEnd();
      }
    };

    return fn(loggedSet, get, api);
  };
};
