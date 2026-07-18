import { headers } from "next/headers";
import { Fraunces, DM_Sans } from "next/font/google";
import type { Metadata } from "next";
import { getOptionalSession } from "@/lib/auth";
import { LandingPage } from "@/components/landing/landing-page";

const landingDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-landing-display",
  axes: ["SOFT", "WONK", "opsz"],
});

const landingBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-landing-body",
});

const title = "DayMirror — Where Your Life Actually Went";
const description =
  "Plan the future, witness the present, and understand the past. DayMirror turns each hour into a clear record of the life you are actually building.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "DayMirror",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  keywords: [
    "productivity",
    "self improvement",
    "daily reflection",
    "time tracker",
    "time audit",
    "hourly journal",
    "daily planner",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is DayMirror different from a todo app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Todo apps help you plan. DayMirror helps you understand what actually happened — hour by hour. It's a time audit, not another task list.",
      },
    },
    {
      "@type": "Question",
      name: "What is a time audit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Like a financial audit, but for your hours. You reflect on each part of your day, compare it to what you planned, and see patterns over time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I stop wasting my day?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Start with awareness. When you see where time actually goes — without guessing — you can adjust tomorrow with intention instead of guilt.",
      },
    },
  ],
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DayMirror",
  applicationCategory: "ProductivityApplication",
  description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default async function HomePage() {
  const session = await getOptionalSession(await headers());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className={`${landingDisplay.variable} ${landingBody.variable}`}>
        <LandingPage isAuthenticated={!!session} />
      </div>
    </>
  );
}
