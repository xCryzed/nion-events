import { useMemo } from "react";

export const useRegistrationStatus = () => {
  // Use Supabase Auth setting directly: we cannot read it programmatically,
  // so default to enabled and rely on Supabase to block signups when disabled.
  return useMemo(() => ({ isRegistrationEnabled: true, loading: false }), []);
};
