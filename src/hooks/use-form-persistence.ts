import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const useFormPersistence = <T extends Record<string, any>>(
  form: UseFormReturn<T>,
  storageKey: string,
  onSuccessfulSubmit?: () => void
) => {
  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Reset form with saved data
        form.reset(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [form, storageKey]);

  // Save data on every form change
  useEffect(() => {
    const subscription = form.watch((data) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, storageKey]);

  // Clear storage on successful submit
  const clearStorage = () => {
    localStorage.removeItem(storageKey);
    onSuccessfulSubmit?.();
  };

  return { clearStorage };
};