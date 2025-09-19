import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePersonalDataCompletion } from "@/hooks/use-personal-data-completion";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PersonalDataGuardProps {
  children: React.ReactNode;
}

export const PersonalDataGuard: React.FC<PersonalDataGuardProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    isComplete,
    hasData,
    loading: completionLoading,
  } = usePersonalDataCompletion(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Get user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        setUserRole(roleData?.role || null);
      }

      setLoading(false);
    };

    getUser();
  }, []);

  useEffect(() => {
    // Skip guard logic if we're loading or already on the personal data page
    if (
      loading ||
      completionLoading ||
      location.pathname === "/personaldaten"
    ) {
      return;
    }

    // Only redirect employees who haven't completed their personal data
    if (user && userRole === "employee" && !isComplete) {
      toast({
        title: "Personaldaten erforderlich",
        description:
          "Bitte vervollständigen Sie Ihre Personaldaten, bevor Sie auf andere Bereiche zugreifen können.",
        variant: "default",
      });
      navigate("/personaldaten", { replace: true });
    }
  }, [
    user,
    userRole,
    isComplete,
    loading,
    completionLoading,
    location.pathname,
    navigate,
  ]);

  // Show loading state while checking
  if (loading || completionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
