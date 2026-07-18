"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { AppSidebarBrand } from "@/components/layout/app-sidebar-brand";
import { AppSidebarThemeSwitch } from "@/components/layout/app-sidebar-theme-switch";
import { AppSidebarUpgradeCard } from "@/components/layout/app-sidebar-upgrade";
import { AppSidebarUser } from "@/components/layout/app-sidebar-user";
import { APP_NAV, APP_NAV_FUTURE } from "@/lib/app-nav";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
};

export function AppSidebar({ onOpenSettings, onOpenFeedback }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset" className="sidebar-shell">
      <AppSidebarBrand />

      <SidebarContent className="sidebar-content-scroll px-1">
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="sidebar-section-label px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {APP_NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "sidebar-nav-btn h-8 rounded-lg px-2.5 text-[13px] transition-colors duration-150",
                        active && "sidebar-nav-btn-active",
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4 opacity-80" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="sidebar-soft-separator mx-3" />

        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="sidebar-section-label px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            Coming soon
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {APP_NAV_FUTURE.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label} className="relative">
                    <SidebarMenuButton
                      disabled
                      tooltip={item.label}
                      className="sidebar-nav-btn h-8 rounded-lg px-2.5 text-[13px] opacity-60"
                    >
                      <Icon className="size-4 opacity-80" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    <Badge
                      variant="secondary"
                      className="sidebar-soon-badge absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0 text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="sidebar-footer gap-2 px-2 pb-2 pt-0">
        <AppSidebarUpgradeCard />
        <AppSidebarThemeSwitch />
        <AppSidebarUser onOpenSettings={onOpenSettings} onOpenFeedback={onOpenFeedback} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
