import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  X,
  Award,
  BookOpen,
  AlertCircle,
  Check,
  Upload,
  FileText,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { de } from "date-fns/locale";

interface Qualification {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  requires_proof?: boolean;
  proof_types?: string[];
  validity_period_months?: number;
  is_expirable?: boolean;
}

interface QualificationRequest {
  id: string;
  user_id: string;
  qualification_id: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
  admin_notes?: string;
  proof_files?: any[];
  qualifications?: Omit<Qualification, "created_at">;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  reviewed_by_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface UserQualification {
  id: string;
  user_id: string;
  qualification_id: string;
  acquired_date?: string;
  expires_at?: string;
  proof_files?: any;
  qualifications?: {
    id: string;
    name: string;
    description: string;
    is_expirable?: boolean;
    validity_period_months?: number;
  };
}

const Qualifikationen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [userQualifications, setUserQualifications] = useState<
    UserQualification[]
  >([]);
  const [qualificationRequests, setQualificationRequests] = useState<
    QualificationRequest[]
  >([]);
  const [allRequests, setAllRequests] = useState<QualificationRequest[]>([]);
  const [selectedQualification, setSelectedQualification] =
    useState<Qualification | null>(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title =
      "Qualifikationen - DJ Aachen & Eventtechnik | NION Events Mitarbeiterbereich";
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          checkUserRoles(session.user.id);
        }, 0);
      } else {
        setIsEmployee(false);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkUserRoles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isEmployee || isAdmin) {
      fetchQualifications();
      fetchUserQualifications();
      fetchQualificationRequests();
    }
    if (isAdmin) {
      fetchAllRequests();
    }
  }, [isEmployee, isAdmin, user]);

  const checkUserRoles = async (userId: string) => {
    try {
      const [employeeCheck, adminCheck] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId, _role: "employee" }),
        supabase.rpc("has_role", { _user_id: userId, _role: "administrator" }),
      ]);

      if (employeeCheck.error || adminCheck.error) {
        console.error(
          "Error checking roles:",
          employeeCheck.error || adminCheck.error,
        );
        setIsEmployee(false);
        setIsAdmin(false);
      } else {
        setIsEmployee(employeeCheck.data || adminCheck.data);
        setIsAdmin(adminCheck.data);
      }
    } catch (error) {
      console.error("Error in checkUserRoles:", error);
      setIsEmployee(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      const { data, error } = await supabase
        .from("qualifications")
        .select(
          "id, name, description, requires_proof, proof_types, validity_period_months, is_expirable",
        )
        .order("name");

      if (error) {
        console.error("Error fetching qualifications:", error);
        return;
      }

      setQualifications(data || []);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    }
  };

  const fetchUserQualifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("employee_qualifications")
        .select(
          `
                    id,
                    user_id,
                    qualification_id,
                    acquired_date,
                    expires_at,
                    proof_files,
                    qualifications (
                        id,
                        name,
                        description,
                        is_expirable,
                        validity_period_months
                    )
                `,
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching user qualifications:", error);
        return;
      }

      setUserQualifications(data || []);
    } catch (error) {
      console.error("Error fetching user qualifications:", error);
    }
  };

  const fetchQualificationRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("qualification_requests")
        .select(
          `
                    id,
                    user_id,
                    qualification_id,
                    status,
                    requested_at,
                    reviewed_at,
                    reviewed_by,
                    notes,
                    admin_notes
                `,
        )
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching qualification requests:", error);
        return;
      }

      // Fetch qualifications separately and merge
      const qualificationIds = (data || []).map((req) => req.qualification_id);
      if (qualificationIds.length > 0) {
        const { data: qualData } = await supabase
          .from("qualifications")
          .select("id, name, description")
          .in("id", qualificationIds);

        const requestsWithQuals = (data || []).map((request) => ({
          ...request,
          qualifications: qualData?.find(
            (q) => q.id === request.qualification_id,
          ),
        }));

        setQualificationRequests(requestsWithQuals as QualificationRequest[]);
      } else {
        setQualificationRequests((data as QualificationRequest[]) || []);
      }
    } catch (error) {
      console.error("Error fetching qualification requests:", error);
    }
  };

  const fetchAllRequests = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from("qualification_requests")
        .select(
          `
                    id,
                    user_id,
                    qualification_id,
                    status,
                    requested_at,
                    reviewed_at,
                    reviewed_by,
                    notes,
                    admin_notes
                `,
        )
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching all requests:", error);
        return;
      }

      // Fetch related data separately
      const userIds = [...new Set((data || []).map((req) => req.user_id))];
      const qualificationIds = [
        ...new Set((data || []).map((req) => req.qualification_id)),
      ];
      const reviewerIds = [
        ...new Set((data || []).map((req) => req.reviewed_by).filter(Boolean)),
      ];

      const [profilesData, qualificationsData, reviewerProfilesData] =
        await Promise.all([
          userIds.length > 0
            ? supabase
                .from("profiles")
                .select("user_id, first_name, last_name")
                .in("user_id", userIds)
            : Promise.resolve({ data: [] }),
          qualificationIds.length > 0
            ? supabase
                .from("qualifications")
                .select("id, name, description")
                .in("id", qualificationIds)
            : Promise.resolve({ data: [] }),
          reviewerIds.length > 0
            ? supabase
                .from("profiles")
                .select("user_id, first_name, last_name")
                .in("user_id", reviewerIds)
            : Promise.resolve({ data: [] }),
        ]);

      const requestsWithData = (data || []).map((request) => ({
        ...request,
        profiles: profilesData.data?.find((p) => p.user_id === request.user_id),
        qualifications: qualificationsData.data?.find(
          (q) => q.id === request.qualification_id,
        ),
        reviewed_by_profile: request.reviewed_by
          ? reviewerProfilesData.data?.find(
              (p) => p.user_id === request.reviewed_by,
            )
          : undefined,
      }));

      setAllRequests(requestsWithData as QualificationRequest[]);
    } catch (error) {
      console.error("Error fetching all requests:", error);
    }
  };

  const hasQualification = (qualificationId: string): boolean => {
    return userQualifications.some(
      (uq) => uq.qualification_id === qualificationId,
    );
  };

  const hasPendingRequest = (qualificationId: string): boolean => {
    return qualificationRequests.some(
      (req) =>
        req.qualification_id === qualificationId && req.status === "pending",
    );
  };

  const getRequestStatus = (
    qualificationId: string,
  ): QualificationRequest | null => {
    return (
      qualificationRequests.find(
        (req) => req.qualification_id === qualificationId,
      ) || null
    );
  };

  const handleRequestQualification = async () => {
    if (!selectedQualification || !user) return;

    // Validate proof files if required
    if (
      selectedQualification.requires_proof &&
      (!proofFiles || proofFiles.length === 0)
    ) {
      toast.error("Bitte laden Sie die erforderlichen Nachweise hoch.");
      return;
    }

    setUploading(true);
    try {
      let uploadedFiles: any[] = [];

      // Upload proof files if any
      if (proofFiles && proofFiles.length > 0) {
        for (const file of proofFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${selectedQualification.id}_${Date.now()}.${fileExt}`;
          const filePath = `${user.id}/qualifikationsnachweise/${fileName}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("personalakten").upload(filePath, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            toast.error(`Fehler beim Hochladen von ${file.name}`);
            return;
          }

          uploadedFiles.push({
            name: file.name,
            path: uploadData.path,
            size: file.size,
            type: file.type,
          });
        }
      }

      const { error } = await supabase.from("qualification_requests").insert({
        user_id: user.id,
        qualification_id: selectedQualification.id,
        notes: requestNotes || null,
        status: "pending",
        proof_files: uploadedFiles,
      });

      if (error) {
        console.error("Error requesting qualification:", error);
        toast.error("Fehler beim Anfordern der Qualifikation");
        return;
      }

      toast.success("Qualifikation erfolgreich angefordert!");
      setShowRequestDialog(false);
      setSelectedQualification(null);
      setRequestNotes("");
      setProofFiles([]);
      fetchQualificationRequests();
    } catch (error) {
      console.error("Error requesting qualification:", error);
      toast.error("Fehler beim Anfordern der Qualifikation");
    } finally {
      setUploading(false);
    }
  };

  const handleReviewRequest = async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      const { error } = await supabase
        .from("qualification_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
        })
        .eq("id", requestId);

      if (error) {
        console.error("Error reviewing request:", error);
        toast.error("Fehler beim Bearbeiten der Anfrage");
        return;
      }

      toast.success(
        `Anfrage ${status === "approved" ? "genehmigt" : "abgelehnt"}!`,
      );
      setAdminNotes("");
      fetchAllRequests();
      fetchQualificationRequests(); // Refresh user requests too
    } catch (error) {
      console.error("Error reviewing request:", error);
      toast.error("Fehler beim Bearbeiten der Anfrage");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isEmployee) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
            <p className="text-muted-foreground mb-6">
              Sie benötigen Mitarbeiter-Rechte, um auf diese Seite zugreifen zu
              können.
            </p>
            <p className="text-sm text-muted-foreground">
              Bitte melden Sie sich mit Ihrem Mitarbeiterkonto an.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Qualifikationen
          </h1>
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-full">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary text-lg">
                {userQualifications.length}
              </span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              Qualifikationen
            </span>
          </div>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Verfügbare</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-requests"
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Meine Anfragen</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-qualifications"
              className="flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Meine</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qualifications.map((qualification) => {
                const hasQual = hasQualification(qualification.id);
                const pendingRequest = hasPendingRequest(qualification.id);
                const requestStatus = getRequestStatus(qualification.id);

                return (
                  <Card
                    key={qualification.id}
                    className="transition-all hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {qualification.name}
                        </CardTitle>
                        {hasQual && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Erworben
                          </Badge>
                        )}
                        {pendingRequest && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-300"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Ausstehend
                          </Badge>
                        )}
                        {requestStatus?.status === "rejected" && (
                          <Badge variant="destructive">
                            <X className="w-3 h-3 mr-1" />
                            Abgelehnt
                          </Badge>
                        )}
                      </div>
                      {qualification.description && (
                        <CardDescription>
                          {qualification.description}
                        </CardDescription>
                      )}

                      {/* Show proof requirements */}
                      {qualification.requires_proof && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">
                              Nachweis erforderlich
                            </span>
                          </div>
                          {qualification.proof_types &&
                            qualification.proof_types.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {qualification.proof_types.map(
                                  (type, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {type}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      )}

                      {/* Show validity period */}
                      {qualification.is_expirable &&
                        qualification.validity_period_months && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Gültig für {qualification.validity_period_months}{" "}
                              Monate
                            </span>
                          </div>
                        )}
                    </CardHeader>
                    <CardContent>
                      {!hasQual &&
                      !pendingRequest &&
                      requestStatus?.status !== "rejected" ? (
                        <Button
                          onClick={() => {
                            setSelectedQualification(qualification);
                            setShowRequestDialog(true);
                          }}
                          className="w-full"
                        >
                          Qualifikation anfragen
                        </Button>
                      ) : requestStatus?.status === "rejected" &&
                        requestStatus.admin_notes ? (
                        <div className="space-y-2">
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Ablehnungsgrund:</strong>{" "}
                              {requestStatus.admin_notes}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedQualification(qualification);
                              setShowRequestDialog(true);
                            }}
                            className="w-full"
                          >
                            Erneut anfragen
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-4">
            {qualificationRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Keine Anfragen</h3>
                  <p className="text-muted-foreground">
                    Sie haben noch keine Qualifikationen angefragt.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {qualificationRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{request.qualifications?.name}</CardTitle>
                          <CardDescription>
                            Angefragt am{" "}
                            {format(
                              new Date(request.requested_at),
                              "dd.MM.yyyy HH:mm",
                              { locale: de },
                            )}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            request.status === "approved"
                              ? "secondary"
                              : request.status === "rejected"
                                ? "destructive"
                                : "outline"
                          }
                          className={
                            request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                : ""
                          }
                        >
                          {request.status === "approved" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {request.status === "pending" && (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {request.status === "rejected" && (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {request.status === "approved"
                            ? "Genehmigt"
                            : request.status === "rejected"
                              ? "Abgelehnt"
                              : "Ausstehend"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {request.notes && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            <strong>Ihre Notiz:</strong> {request.notes}
                          </p>
                        </div>
                      )}
                      {request.admin_notes && (
                        <div
                          className={`p-3 rounded-lg ${
                            request.status === "approved"
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              request.status === "approved"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            <strong>Administrator-Notiz:</strong>{" "}
                            {request.admin_notes}
                          </p>
                        </div>
                      )}
                      {request.reviewed_at && (
                        <p className="text-xs text-muted-foreground">
                          Bearbeitet am{" "}
                          {format(
                            new Date(request.reviewed_at),
                            "dd.MM.yyyy HH:mm",
                            { locale: de },
                          )}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-qualifications" className="space-y-4">
            {userQualifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Keine Qualifikationen
                  </h3>
                  <p className="text-muted-foreground">
                    Sie haben noch keine Qualifikationen erworben.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userQualifications.map((userQual) => {
                  const isExpired =
                    userQual.expires_at &&
                    isBefore(new Date(userQual.expires_at), new Date());
                  const isExpiringSoon =
                    userQual.expires_at &&
                    isAfter(new Date(userQual.expires_at), new Date()) &&
                    isBefore(
                      new Date(userQual.expires_at),
                      addDays(new Date(), 30),
                    );

                  return (
                    <Card
                      key={userQual.id}
                      className={`${
                        isExpired
                          ? "border-red-200 bg-red-50/50"
                          : isExpiringSoon
                            ? "border-orange-200 bg-orange-50/50"
                            : "border-green-200 bg-green-50/50"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {userQual.qualifications?.name}
                          </CardTitle>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Erworben
                            </Badge>
                            {isExpired && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Abgelaufen
                              </Badge>
                            )}
                            {isExpiringSoon && (
                              <Badge
                                variant="outline"
                                className="bg-orange-100 text-orange-700 border-orange-300 text-xs"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Läuft ab
                              </Badge>
                            )}
                          </div>
                        </div>
                        {userQual.qualifications?.description && (
                          <CardDescription>
                            {userQual.qualifications.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {userQual.acquired_date && (
                            <p>
                              Erworben am{" "}
                              {format(
                                new Date(userQual.acquired_date),
                                "dd.MM.yyyy",
                                { locale: de },
                              )}
                            </p>
                          )}
                          {userQual.expires_at && (
                            <p
                              className={`${isExpired ? "text-red-600 font-medium" : isExpiringSoon ? "text-orange-600 font-medium" : ""}`}
                            >
                              {isExpired ? "Abgelaufen am" : "Gültig bis"}{" "}
                              {format(
                                new Date(userQual.expires_at),
                                "dd.MM.yyyy",
                                { locale: de },
                              )}
                            </p>
                          )}
                          {!userQual.expires_at &&
                            userQual.qualifications?.is_expirable === false && (
                              <p className="text-green-600">
                                Unbegrenzt gültig
                              </p>
                            )}
                        </div>

                        {/* Show renewal option for expired qualifications */}
                        {isExpired && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              const qualification = qualifications.find(
                                (q) => q.id === userQual.qualification_id,
                              );
                              if (qualification) {
                                setSelectedQualification(qualification);
                                setShowRequestDialog(true);
                              }
                            }}
                          >
                            Erneuerung beantragen
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Request Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Qualifikation anfragen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">{selectedQualification?.name}</h3>
                {selectedQualification?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedQualification.description}
                  </p>
                )}

                {selectedQualification?.is_expirable &&
                  selectedQualification?.validity_period_months && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Gültig für{" "}
                        {selectedQualification.validity_period_months} Monate
                      </span>
                    </div>
                  )}
              </div>

              {/* Proof Requirements */}
              {selectedQualification?.requires_proof && (
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Nachweis erforderlich</span>
                    </div>
                    {selectedQualification.proof_types &&
                      selectedQualification.proof_types.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm text-orange-700">
                            Bitte laden Sie folgende Nachweise hoch:
                          </p>
                          <ul className="list-disc list-inside text-sm text-orange-600 ml-2">
                            {selectedQualification.proof_types.map(
                              (type, index) => (
                                <li key={index}>{type}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="proof-files"
                      className="text-sm font-medium"
                    >
                      Nachweisdateien hochladen *
                    </Label>
                    <Input
                      id="proof-files"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setProofFiles(files);
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Erlaubte Formate: PDF, JPG, PNG, DOC, DOCX (max. 10MB pro
                      Datei)
                    </p>

                    {proofFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Ausgewählte Dateien:
                        </p>
                        <div className="space-y-1">
                          {proofFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded"
                            >
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="flex-1">{file.name}</span>
                              <span className="text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFiles = proofFiles.filter(
                                    (_, i) => i !== index,
                                  );
                                  setProofFiles(newFiles);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notiz (optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Warum benötigen Sie diese Qualifikation? Fügen Sie weitere Informationen hinzu..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRequestDialog(false);
                    setProofFiles([]);
                    setRequestNotes("");
                  }}
                  className="flex-1"
                  disabled={uploading}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleRequestQualification}
                  className="flex-1"
                  disabled={
                    uploading ||
                    (selectedQualification?.requires_proof &&
                      proofFiles.length === 0)
                  }
                >
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Wird hochgeladen...
                    </>
                  ) : (
                    "Anfragen"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Qualifikationen;
