import { Bell, CheckCheck, Search, Trash2, GraduationCap, BellRing, CalendarDays, Award, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth";
import { useNotifications } from "@/context/notifications";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const notificationIcons = {
  mentor: BellRing,
  task: CalendarDays,
  system: GraduationCap,
  pfe: Award,
};

export function TopBar() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="text-foreground" />
      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, mentors, companies…"
          className="h-9 border-border bg-muted/50 pl-9 focus-visible:ring-accent"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full bg-accent p-0 text-[10px] text-accent-foreground">
                  {unreadCount}
                </Badge>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={markAllAsRead}>
                  <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={clearAll}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <ScrollArea className="max-h-[24rem]">
              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications right now.</div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type];

                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`mb-2 cursor-pointer rounded-xl border p-3 focus:bg-muted ${
                          notification.read ? "border-border bg-background" : "border-accent/30 bg-accent-soft/30"
                        }`}
                        onSelect={(event) => {
                          event.preventDefault();
                          markAsRead(notification.id);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-accent shadow-sm">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                              {!notification.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" /> : null}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{notification.message}</p>
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <DropdownMenuSeparator />
            <div className="px-4 py-3 text-xs text-muted-foreground">
              Click a notification to mark it as read.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild variant="ghost" className="h-auto rounded-full p-0 hover:bg-transparent">
          <Link to="/profile" className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3 shadow-sm">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight">{user?.name ?? "Sara Amrani"}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">{user?.email ?? "CS · Year 5"}</p>
            </div>
          </Link>
        </Button>
      </div>
    </header>
  );
}
