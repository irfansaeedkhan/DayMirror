import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.BETTER_AUTH_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: {
    default: "DayMirror — The Time Audit App",
    template: "%s — DayMirror",
  },
  description: "See where your day actually went. Hourly reflection & productivity tracker.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("daymirror-theme")||"light";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.setAttribute("data-theme",d?"dark":"light");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <AppToaster />
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
