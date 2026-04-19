import { GraduationCap, LayoutDashboard, Brain, Target, Home, Settings, LogOut, MessageSquareText, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { getAssignedSupervisorName } from "@/lib/studentJourney";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Agent", url: "/ai-agent", icon: Sparkles },
  { title: "AI Diagnosis", url: "/diagnosis", icon: Brain },
  { title: "PFE & Matching", url: "/pfe", icon: Target },
  { title: "Mentor Hub", url: "/mentor-hub", icon: MessageSquareText },
];

const mentorItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Mentor Dashboard", url: "/mentor-dashboard", icon: LayoutDashboard },
  { title: "AI Agent", url: "/ai-agent", icon: Sparkles },
  { title: "Mentor Hub", url: "/mentor-hub", icon: MessageSquareText },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const items = user?.role === "mentor" ? mentorItems : studentItems;

  const getCls = (path: string) => {
    const active = pathname === path;
    return active
      ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-accent font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-accent shadow-glow">
            <GraduationCap className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-accent-foreground">PFE Compass</span>
              <span className="text-xs text-sidebar-foreground/70">AI Student Companion</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          {!collapsed && user ? (
            <div className="px-3 pb-2 pt-1 text-xs text-sidebar-foreground/70">
              Signed in as <span className="font-medium text-sidebar-accent-foreground">{user.name}</span>
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {user.role}
              </span>
              {user.role === "student" ? (
                <div className="mt-2 rounded-lg bg-muted/60 px-2 py-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assigned supervisor</p>
                  <p className="mt-0.5 font-medium text-sidebar-accent-foreground">{getAssignedSupervisorName()}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className={getCls("/settings")}>
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
