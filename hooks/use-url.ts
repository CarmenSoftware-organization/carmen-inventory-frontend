"use client";

import { useCallback, useSyncExternalStore } from "react";

const URL_CHANGE_EVENT = "useurl:change";

function getURLParam(paramName: string, defaultValue: string): string {
  return (
    new URLSearchParams(window.location.search).get(paramName) ?? defaultValue
  );
}

type URLStateOptions = {
  defaultValue?: string;
  onUpdate?: (value: string) => void;
};

export const useURL = (paramName: string, options: URLStateOptions = {}) => {
  const { defaultValue = "", onUpdate } = options;

  const subscribe = useCallback(
    (callback: () => void) => {
      window.addEventListener("popstate", callback);
      window.addEventListener(URL_CHANGE_EVENT, callback);
      return () => {
        window.removeEventListener("popstate", callback);
        window.removeEventListener(URL_CHANGE_EVENT, callback);
      };
    },
    [],
  );

  const getSnapshot = useCallback(
    () => getURLParam(paramName, defaultValue),
    [paramName, defaultValue],
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateValue = useCallback(
    (newValue: string) => {
      const url = new URL(window.location.href);
      if (newValue) {
        url.searchParams.set(paramName, newValue);
      } else {
        url.searchParams.delete(paramName);
      }

      if (url.toString() !== window.location.href) {
        window.history.replaceState(
          { ...window.history.state },
          "",
          url.toString(),
        );
        window.dispatchEvent(new CustomEvent(URL_CHANGE_EVENT));
      }

      onUpdate?.(newValue);
    },
    [paramName, onUpdate],
  );

  return [value, updateValue] as const;
};
