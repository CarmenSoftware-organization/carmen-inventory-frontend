"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const URL_CHANGE_EVENT = "useurl:change";

type URLStateOptions = {
  defaultValue?: string;
  onUpdate?: (value: string) => void;
};

export const useURL = (paramName: string, options: URLStateOptions = {}) => {
  const { defaultValue = "", onUpdate } = options;
  const isUpdatingRef = useRef(false);

  const [value, setValue] = useState(() => {
    if (globalThis.window !== undefined) {
      return (
        new URLSearchParams(globalThis.window.location.search).get(paramName) ??
        defaultValue
      );
    }
    return defaultValue;
  });

  const updateValue = useCallback(
    (newValue: string) => {
      if (isUpdatingRef.current) return;

      setValue(newValue);

      if (globalThis.window !== undefined) {
        isUpdatingRef.current = true;

        const url = new URL(globalThis.window.location.href);
        if (newValue) {
          url.searchParams.set(paramName, newValue);
        } else {
          url.searchParams.delete(paramName);
        }

        if (url.toString() !== globalThis.window.location.href) {
          globalThis.window.history.replaceState(
            { ...globalThis.window.history.state },
            "",
            url.toString(),
          );
          globalThis.window.dispatchEvent(new CustomEvent(URL_CHANGE_EVENT));
        }

        onUpdate?.(newValue);
        isUpdatingRef.current = false;
      }
    },
    [paramName, onUpdate],
  );

  useEffect(() => {
    if (globalThis.window === undefined) return;

    const syncFromURL = () => {
      if (isUpdatingRef.current) return;
      const currentValue =
        new URLSearchParams(globalThis.window.location.search).get(paramName) ??
        defaultValue;
      setValue((prev) => {
        if (prev !== currentValue) {
          onUpdate?.(currentValue);
          return currentValue;
        }
        return prev;
      });
    };

    globalThis.window.addEventListener("popstate", syncFromURL);
    globalThis.window.addEventListener(URL_CHANGE_EVENT, syncFromURL);

    return () => {
      if (globalThis.window !== undefined) {
        globalThis.window.removeEventListener("popstate", syncFromURL);
        globalThis.window.removeEventListener(URL_CHANGE_EVENT, syncFromURL);
      }
    };
  }, [paramName, defaultValue, onUpdate]);

  return [value, updateValue] as const;
};
