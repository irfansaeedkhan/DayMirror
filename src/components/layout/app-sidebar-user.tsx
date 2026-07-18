"use client";

import { useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  LogOut,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AppSidebarUserProps = {
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
};

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? "U";
}

function UserSummary({
  name,
  email,
  image,
  className,
}: {
  name: string;
  email: string;
  image?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-left text-sm", className)}>
      <Avatar className="size-7 rounded-md">
        <AvatarImage src={image ?? undefined} alt={name} />
        <AvatarFallback className="rounded-md text-[10px]">{getInitials(name, email)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-xs leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-[11px] text-muted-foreground">{email}</span>
      </div>
    </div>
  );
}

export function AppSidebarUser({ onOpenSettings, onOpenFeedback }: AppSidebarUserProps) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { data: session } = useSession();

  const user = session?.user;
  if (!user) return null;

  const name = user.name ?? "Account";
  const email = user.email ?? "";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="sidebar-user-btn h-8 cursor-pointer rounded-lg px-2 py-1.5 data-[state=open]:bg-secondary"
            >
              <Avatar className="size-7 rounded-md">
                <AvatarImage src={user.image ?? undefined} alt={name} />
                <AvatarFallback className="rounded-md text-[10px]">{getInitials(name, email)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-[11px] text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-3.5 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <UserSummary name={name} email={email} image={user.image} className="px-1 py-1.5" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={onOpenSettings}>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={onOpenFeedback}>
                <MessageSquare className="size-4" />
                Send feedback
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleSignOut}>
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
