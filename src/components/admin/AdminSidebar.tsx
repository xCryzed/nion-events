import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Calendar,
  MessageSquare,
  Users,
  UserCheck,
  Settings,
  Home,
  Award,
  Clock
} from 'lucide-react';

interface AdminSidebarProps {
  eventRequestsCount: number;
  contactRequestsCount: number;
  usersCount: number;
  internalEventsCount: number;
  personnelCount: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({
                               eventRequestsCount,
                               contactRequestsCount,
                               usersCount,
                               internalEventsCount,
                               personnelCount,
                               activeTab,
                               onTabChange
                             }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      count: null
    },
    {
      id: 'event-requests',
      title: 'Angebotsanfragen',
      icon: Calendar,
      count: eventRequestsCount
    },
    {
      id: 'contacts',
      title: 'Kontaktanfragen',
      icon: MessageSquare,
      count: contactRequestsCount
    },
    {
      id: 'events',
      title: 'Veranstaltungen',
      icon: Calendar,
      count: internalEventsCount
    },
    {
      id: 'users',
      title: 'Benutzer',
      icon: Users,
      count: usersCount
    },
    {
      id: 'invitations',
      title: 'Einladungen',
      icon: Users,
      count: null
    },
    {
      id: 'personnel',
      title: 'Personal',
      icon: UserCheck,
      count: personnelCount
    },
    {
      id: 'qualifications',
      title: 'Qualifikationen',
      icon: Award,
      count: null
    },
    {
      id: 'time-records',
      title: 'Stundenerfassung',
      icon: Clock,
      count: null
    },
    {
      id: 'settings',
      title: 'Einstellungen',
      icon: Settings,
      count: null
    }
  ];

  const isActive = (itemId: string) => activeTab === itemId;

  return (
      <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
        {/* Header mit Logo/Title */}
        <div className="h-16 flex items-center p-4 border-b">
          {!collapsed && (
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="font-semibold text-lg">Administration</h2>
              </div>
          )}
          {collapsed && (
              <div className="flex justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
          )}
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Verwaltung
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                          asChild
                          className={`h-16 ${isActive(item.id)
                              ? "bg-primary/10 text-primary font-medium border border-primary/20"
                              : "hover:bg-muted/50"
                          }`}
                      >
                        <button
                            onClick={() => onTabChange(item.id)}
                            className="w-full h-full justify-start"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && (
                              <div className="flex items-center justify-between w-full">
                                <span>{item.title}</span>
                                {item.count !== null && item.count > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto text-xs"
                                    >
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
          </SidebarGroup>

          {/* Zurück zur Hauptseite */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-16">
                    <NavLink
                        to="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground h-full"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Zur Hauptseite</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
  );
}