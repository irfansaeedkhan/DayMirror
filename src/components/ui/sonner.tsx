import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }: ComponentProps<typeof Sonner>) => (
  <Sonner
    className="toaster group"
    toastOptions={{
      classNames: {
        toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster };
