"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const NARROW_BREAKPOINT = 1024;
const USER_COLLAPSED_KEY = "sidebar-user-collapsed";

function readSidebarCookie(): boolean | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=(true|false)/);
  if (!match) return null;
  return match[1] === "true";
}

export function useResponsiveSidebarOpen() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (isMobile) return;

    const narrow = window.innerWidth < NARROW_BREAKPOINT;
    if (narrow) {
      setOpen(false);
      return;
    }

    const cookieOpen = readSidebarCookie();
    const userCollapsed = sessionStorage.getItem(USER_COLLAPSED_KEY) === "true";

    if (cookieOpen !== null) {
      setOpen(cookieOpen);
      return;
    }

    setOpen(!userCollapsed);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;

    function syncForViewport() {
      const narrow = window.innerWidth < NARROW_BREAKPOINT;
      const userCollapsed = sessionStorage.getItem(USER_COLLAPSED_KEY) === "true";

      if (narrow) {
        setOpen(false);
        return;
      }

      if (!userCollapsed) {
        setOpen(true);
      }
    }

    const mql = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", syncForViewport);
    return () => mql.removeEventListener("change", syncForViewport);
  }, [isMobile]);

  function onOpenChange(next: boolean) {
    setOpen(next);

    if (isMobile || typeof window === "undefined") return;

    const narrow = window.innerWidth < NARROW_BREAKPOINT;
    if (!narrow) {
      sessionStorage.setItem(USER_COLLAPSED_KEY, String(!next));
    }
  }

  return { open, onOpenChange, isMobile };
}
