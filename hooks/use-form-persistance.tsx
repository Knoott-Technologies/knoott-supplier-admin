"use client";

import { useEffect, useRef } from "react";
import type { DefaultValues, UseFormReturn } from "react-hook-form";

// Simple debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function useFormPersistence<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  key: string,
  excludeFields: string[] = [],
  debounceMs: number = 500
) {
  // Use a ref to track if we're currently loading data
  const isLoadingData = useRef(false);

  // Load saved form data on initial render only
  useEffect(() => {
    try {
      isLoadingData.current = true;
      const savedData = localStorage.getItem(key);

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Filter out excluded fields
        const filteredData = Object.fromEntries(
          Object.entries(parsedData).filter(
            ([fieldKey]) => !excludeFields.includes(fieldKey)
          )
        );

        // Only set values that exist in the form
        const formValues = form.getValues();
        const validData = Object.keys(filteredData).reduce(
          (acc, key) => {
            if (key in formValues) {
              acc[key] = filteredData[key];
            }
            return acc;
          },
          {} as Record<string, any>
        );

        // Reset form with saved data
        form.reset(validData as DefaultValues<T>);
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    } finally {
      // Use setTimeout to ensure this happens after the current render cycle
      setTimeout(() => {
        isLoadingData.current = false;
      }, 0);
    }
  }, []); // Empty dependency array ensures this only runs once

  // Save form data on changes with debounce
  useEffect(() => {
    // Create debounced save function
    const saveFormData = debounce((formValues: Partial<T>) => {
      try {
        if (formValues && !isLoadingData.current) {
          // Filter out excluded fields
          const dataToSave = Object.fromEntries(
            Object.entries(formValues).filter(
              ([fieldKey]) => !excludeFields.includes(fieldKey)
            )
          );

          localStorage.setItem(key, JSON.stringify(dataToSave));
        }
      } catch (error) {
        console.error("Error saving form data:", error);
      }
    }, debounceMs);

    // Subscribe to form changes
    const subscription = form.watch((formValues) => {
      if (!isLoadingData.current) {
        saveFormData(formValues);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, key, excludeFields, debounceMs]);

  // Function to clear saved form data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error clearing saved form data:", error);
    }
  };

  return { clearSavedData };
}
