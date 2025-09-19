/**
 * Clears all form-related data from localStorage
 * This should be called on logout to prevent data leakage between users
 */
export const clearFormData = () => {
  const keys = Object.keys(localStorage);
  const formKeys = keys.filter(
    (key) =>
      key.startsWith("form-") ||
      key.startsWith("personal-data") ||
      key.includes("stepper") ||
      key.includes("formData"),
  );

  formKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log(`Cleared ${formKeys.length} form data keys from localStorage`);
};

/**
 * Clears all localStorage data except essential app settings
 */
export const clearAllUserData = () => {
  const keys = Object.keys(localStorage);
  const preserveKeys = ["theme", "language", "cookie-consent"];

  keys.forEach((key) => {
    if (!preserveKeys.includes(key)) {
      localStorage.removeItem(key);
    }
  });
};
