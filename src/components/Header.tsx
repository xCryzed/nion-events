import { useState, useEffect } from "react";
import { trackError } from "@/hooks/use-google-analytics";
import {
  Menu,
  X,
  LogOut,
  Settings,
  Users,
  Calendar,
  User as UserIcon,
  FileText,
  Shield,
  MessageSquare,
  Award,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackEvent } from "@/hooks/use-google-analytics";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { clearFormData } from "@/utils/localStorage";
import nionLogo from "@/assets/nion-logo-white.svg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<{
    first_name: string | null;
    last_name: string | null;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user profile when authenticated
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
          checkAdminRole(session.user.id);
          checkEmployeeRole(session.user.id);
        }, 0);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setIsEmployee(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id);
        checkAdminRole(session.user.id);
        checkEmployeeRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        trackError(error.message, "data_fetch", "header_component", {
          user_id: userId,
          query_type: "user_profile",
        });
        return;
      }

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      trackError(
        error instanceof Error ? error : "Profile fetch failed",
        "data_fetch",
        "header_component",
        {
          user_id: userId,
        },
      );
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "administrator")
        .maybeSingle();

      setIsAdmin(!error && !!data);
    } catch (error) {
      console.error("Error checking admin role:", error);
      trackError(
        error instanceof Error ? error : "Admin role check failed",
        "authentication",
        "header_component",
        {
          user_id: userId,
        },
      );
      setIsAdmin(false);
    }
  };

  const checkEmployeeRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .in("role", ["employee", "administrator"]);

      setIsEmployee(!error && !!data && data.length > 0);
    } catch (error) {
      console.error("Error checking employee role:", error);
      trackError(
        error instanceof Error ? error : "Employee role check failed",
        "authentication",
        "header_component",
        {
          user_id: userId,
        },
      );
      setIsEmployee(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all form data from localStorage before logout
      clearFormData();

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        trackError(error.message, "authentication", "header_component", {
          action: "logout",
        });
        toast({
          title: "Fehler beim Abmelden",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erfolgreich abgemeldet",
          description: "Sie wurden erfolgreich abgemeldet.",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      trackError(
        error instanceof Error ? error : "Logout failed",
        "authentication",
        "header_component",
      );
    }
  };

  const getInitials = () => {
    if (!userProfile?.first_name || !userProfile?.last_name) return "N";
    return (
      userProfile.first_name.charAt(0) + userProfile.last_name.charAt(0)
    ).toUpperCase();
  };

  const getDisplayName = () => {
    if (!userProfile?.first_name || !userProfile?.last_name) return "Benutzer";
    return `${userProfile.first_name} ${userProfile.last_name}`;
  };

  const navItems = [
    { name: "Unternehmen", href: "#unternehmen" },
    { name: "Leistungen", href: "#services" },
    { name: "Referenzen", href: "#testimonials" },
    { name: "Kontakt", href: "#contact" },
    { name: "Team", href: "#team" },
    { name: "FAQ", href: "#faq" },
  ];

  const handleSectionClick = (href: string) => {
    const sectionId = href.substring(1); // Remove the '#'

    if (location.pathname === "/") {
      // Already on homepage, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to homepage first, then scroll to section
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen ? "glass-card" : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 hover-scale cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="relative">
                <div className="absolute -inset-2 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <img
                  src={nionLogo}
                  alt="NION Events Logo"
                  className="relative w-12 h-12 object-contain filter brightness-0 invert group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col group">
                <span className="text-xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  Events
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    trackEvent(
                      "click",
                      "navigation",
                      `header_${item.name.toLowerCase()}`,
                    );
                    handleSectionClick(item.href);
                  }}
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 p-2 h-auto"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground font-medium">
                        {getDisplayName()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Kunden
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/meine-anfragen"
                        className="cursor-pointer flex items-center"
                        onClick={() =>
                          trackEvent(
                            "click",
                            "navigation",
                            "header_meine_anfragen",
                          )
                        }
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Meine Anfragen
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/meine-angebote"
                        className="cursor-pointer flex items-center"
                        onClick={() =>
                          trackEvent(
                            "click",
                            "navigation",
                            "header_meine_angebote",
                          )
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Meine Angebote
                      </Link>
                    </DropdownMenuItem>

                    {(isEmployee || isAdmin) && (
                      <>
                        <div className="h-px bg-border mx-2 my-1" />
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          Mitarbeiter
                        </div>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/anstehende-events"
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              trackEvent(
                                "click",
                                "navigation",
                                "header_anstehende_events",
                              )
                            }
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Anstehende Events
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/personaldaten"
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              trackEvent(
                                "click",
                                "navigation",
                                "header_personaldaten",
                              )
                            }
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            Personaldaten
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/meine-events"
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              trackEvent(
                                "click",
                                "navigation",
                                "header_meine_events",
                              )
                            }
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Meine Events
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/meine-vertraege"
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              trackEvent(
                                "click",
                                "navigation",
                                "header_meine_vertraege",
                              )
                            }
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Meine Verträge
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/stundenerfassung"
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              trackEvent(
                                "click",
                                "navigation",
                                "header_stundenerfassung",
                              )
                            }
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Stundenerfassung
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <div className="h-px bg-border mx-2 my-1" />
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          Administration
                        </div>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/administration"
                            className="cursor-pointer flex items-center"
                            onClick={() =>
                              trackEvent(
                                "click",
                                "admin",
                                "header_administration",
                              )
                            }
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Administration
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <div className="h-px bg-border mx-2 my-1" />
                    <DropdownMenuItem
                      onClick={() => {
                        trackEvent("click", "auth", "header_logout");
                        handleLogout();
                      }}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/anmelden"
                  onClick={() => trackEvent("click", "auth", "header_login")}
                >
                  <Button className="btn-hero">Anmelden</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-4 animate-fade-in glass-card p-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSectionClick(item.href)}
                  className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 text-left w-full"
                >
                  {item.name}
                </button>
              ))}
              <Link
                to="/meine-anfragen"
                className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Meine Anfragen
              </Link>
              <Link
                to="/meine-angebote"
                className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Meine Angebote
              </Link>
              {(isEmployee || isAdmin) && (
                <>
                  <Link
                    to="/anstehende-events"
                    className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Anstehende Events
                  </Link>
                  <Link
                    to="/personaldaten"
                    className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Personaldaten
                  </Link>
                  <Link
                    to="/meine-events"
                    className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meine Events
                  </Link>
                  <Link
                    to="/qualifikationen"
                    className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Qualifikationen
                  </Link>
                  <Link
                    to="/stundenerfassung"
                    className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Stundenerfassung
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/administration"
                  className="block text-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Administration
                </Link>
              )}
              {user ? (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 p-2 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground font-medium">
                      {getDisplayName()}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    className="w-full"
                    variant="outline"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </Button>
                </div>
              ) : (
                <Link to="/anmelden">
                  <Button className="btn-hero w-full mt-4">Anmelden</Button>
                </Link>
              )}
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;
