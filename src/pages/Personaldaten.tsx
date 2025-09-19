import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { PersonalDataCard } from "@/components/PersonalDataCard";
import { PersonalDataSkeleton } from "@/components/PersonalDataSkeleton";
import { usePersonalDataCompletion } from "@/hooks/use-personal-data-completion";

const Personaldaten: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [personalData, setPersonalData] = useState<any>(null);
  const [showStepper, setShowStepper] = useState(false);
  const [loading, setLoading] = useState(true);

  const completion = usePersonalDataCompletion(user?.id);

  useEffect(() => {
    document.title =
      "Personaldaten - DJ Aachen & Eventtechnik | NION Events Mitarbeiterbereich";
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/anmelden");
          return;
        }
        setUser(user);

        // Load existing personal data
        const { data: personalData } = await supabase
          .from("employee_personal_data")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (personalData) {
          setPersonalData(personalData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const handleEdit = () => {
    setShowStepper(true);
  };

  const handleStepperComplete = () => {
    setShowStepper(false);
    // Refresh data
    const refreshData = async () => {
      if (user) {
        const { data: personalData } = await supabase
          .from("employee_personal_data")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (personalData) {
          setPersonalData(personalData);
        }
      }
    };
    refreshData();
  };

  // Show skeleton while loading
  if (loading || completion.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </Button>
            </div>
            <PersonalDataSkeleton />
          </div>
        </main>
      </div>
    );
  }

  // Show stepper if no data exists or user explicitly requested to edit
  if (!completion.hasData || showStepper) {
    // Import PersonaldatenStepper component dynamically to avoid circular imports
    const PersonaldatenStepper = React.lazy(
      () => import("./PersonaldatenStepper"),
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <React.Suspense
            fallback={
              <div className="text-center py-8">
                <p className="text-muted-foreground">Lade Formular...</p>
              </div>
            }
          >
            <PersonaldatenStepper
              onComplete={handleStepperComplete}
              onCancel={() =>
                personalData ? setShowStepper(false) : navigate(-1)
              }
              hasExistingData={!!personalData}
            />
          </React.Suspense>
        </main>
      </div>
    );
  }

  // Show card view for existing data
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {personalData && (
            <PersonalDataCard data={personalData} onEdit={handleEdit} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Personaldaten;
