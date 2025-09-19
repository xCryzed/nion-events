import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  Settings,
  Home,
  UserPlus,
  BarChart3,
  Database,
  Shield,
  ChevronRight,
  Award,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import nionLogo from '@/assets/nion-logo-white.svg';
import packageJson from '../../../package.json';

interface ProfessionalAdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  eventRequestsCount: number;
  contactRequestsCount: number;
  usersCount: number;
  internalEventsCount: number;
  personnelCount: number;
  invitationsCount: number;
}

export function ProfessionalAdminSidebar({
  activeTab,
  onTabChange,
  eventRequestsCount,
  contactRequestsCount,
  usersCount,
  internalEventsCount,
  personnelCount,
  invitationsCount,
}: ProfessionalAdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navigationGroups = [
    {
      label: "Übersicht",
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: LayoutDashboard,
          count: null,
          description: 'Übersicht und Statistiken'
        },
        {
          id: 'analytics',
          title: 'Analytics',
          icon: BarChart3,
          count: null,
          description: 'Detaillierte Auswertungen'
        },
      ]
    },
    {
      label: "Verwaltung",
      items: [
        {
          id: 'event-requests',
          title: 'Angebotsanfragen',
          icon: Calendar,
          count: eventRequestsCount,
          description: 'Event-Anfragen bearbeiten'
        },
        {
          id: 'contacts',
          title: 'Kontaktanfragen',
          icon: MessageSquare,
          count: contactRequestsCount,
          description: 'Kundenkommunikation'
        },
        {
          id: 'events',
          title: 'Veranstaltungen',
          icon: Calendar,
          count: internalEventsCount,
          description: 'Interne Events verwalten'
        },
      ]
    },
    {
      label: "Personal",
      items: [
        {
          id: 'users',
          title: 'Benutzer',
          icon: Users,
          count: usersCount,
          description: 'Benutzerverwaltung'
        },
        {
          id: 'invitations',
          title: 'Einladungen',
          icon: UserPlus,
          count: invitationsCount,
          description: 'Mitarbeiter einladen'
        },
        {
          id: 'personnel',
          title: 'Personalakten',
          icon: FileText,
          count: personnelCount,
          description: 'Mitarbeiterdaten'
        },
        {
          id: 'qualifications',
          title: 'Qualifikationen',
          icon: Award,
          count: null,
          description: 'Qualifikationen verwalten'
        },
        {
          id: 'time-records',
          title: 'Stundenerfassung',
          icon: Clock,
          count: null,
          description: 'Arbeitszeiten verwalten'
        },
      ]
    },
    {
      label: "System",
      items: [
        {
          id: 'settings',
          title: 'Einstellungen',
          icon: Settings,
          count: null,
          description: 'Systemkonfiguration'
        },
        {
          id: 'security',
          title: 'Sicherheit',
          icon: Shield,
          count: null,
          description: 'Sicherheitseinstellungen'
        },
        {
          id: 'logs',
          title: 'System-Logs',
          icon: Database,
          count: null,
          description: 'Protokolle einsehen'
        },
      ]
    }
  ];

  const isActive = (itemId: string) => activeTab === itemId;

  return (
      <Sidebar
        collapsible="icon"
        className="z-40"
      >
      {/* Header */}
      <SidebarHeader className="border-b border-border/50">
        <div className={`flex items-center gap-3 p-4 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0">
            <img 
              src={nionLogo} 
              alt="NION Logo" 
              className="h-8 w-8 text-primary"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h2 className="font-bold text-lg leading-none">Administration</h2>
              <p className="text-xs text-muted-foreground mt-1">NION Events</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label} className="py-2">
            <SidebarGroupLabel 
              className={`px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
                collapsed ? "sr-only" : ""
              }`}
            >
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      className={`h-12 rounded-lg transition-all duration-200 ${
                        isActive(item.id)
                          ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm"
                          : "hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <button
                        onClick={() => onTabChange(item.id)}
                        className="w-full h-full justify-start relative group"
                      >
                        <div className="flex items-center w-full">
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${
                            isActive(item.id) ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          
                          {!collapsed && (
                            <>
                              <div className="flex flex-col items-start ml-3 flex-1 min-w-0">
                                <span className="text-sm font-medium truncate">
                                  {item.title}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {item.count !== null && item.count > 0 && (
                                  <Badge
                                    variant={isActive(item.id) ? "default" : "secondary"}
                                    className="text-xs h-5 px-2"
                                  >
                                    {item.count}
                                  </Badge>
                                )}
                                {isActive(item.id) && (
                                  <ChevronRight className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                            {item.title}
                            {item.count !== null && item.count > 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {item.count}
                              </Badge>
                            )}
                          </div>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {groupIndex < navigationGroups.length - 1 && <Separator className="my-2" />}
          </SidebarGroup>
        ))}

      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border/50 p-4">
        {!collapsed ? (
          <div className="space-y-3">
            {/* Back to Main Site */}
            <NavLink
              to="/"
              className="flex items-center gap-3 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Zur Hauptseite</span>
            </NavLink>
            
            <Separator />
            
            {/* Version Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Version</span>
              <Badge variant="outline" className="text-xs">
                v{packageJson.version}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <NavLink
              to="/"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}