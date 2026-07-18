"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { STORY_HOURS, StoryTimeline } from "@/components/landing/story-timeline";
import { cn } from "@/lib/utils";

type StoryLandingPageProps = {
  isAuthenticated: boolean;
};

const DREAMS = ["Launch a business", "Learn a skill", "Write a book", "Get fit", "Become financially free"];

const DISTRACTIONS = [
  "Email",
  "Meetings",
  "Scrolling",
  "YouTube",
  "Research",
  "Coffee",
  "Notifications",
  "One more video",
];

const HOUR_STEPS = [24, 16, 8, 2, 0];

const STATS = [
  { label: "Hours focused", value: "412" },
  { label: "Hours reclaimed", value: "89" },
  { label: "Projects completed", value: "7" },
  { label: "Consistency streak", value: "31d" },
];

function StoryCta({
  isAuthenticated,
  children,
  variant = "primary",
  className,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const href = isAuthenticated ? "/tracker" : "/signup";

  if (variant === "ghost") {
    return (
      <Link href={href} className={cn("story-cta-ghost", className)}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("story-cta", className)}>
      {children}
      <ArrowRight className="size-4" />
    </Link>
  );
}

function HourCounter({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= HOUR_STEPS.length - 1) clearInterval(id);
    }, 700);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="story-hour-counter" aria-hidden>
      {HOUR_STEPS.map((n, i) => (
        <span
          key={n}
          className={cn("story-hour-num", i === step && active && "story-hour-num-active", i < step && "story-hour-num-past")}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="story-particles" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="story-particle"
          style={{
            left: `${(i * 17 + 5) % 95}%`,
            top: `${(i * 23 + 8) % 85}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${5 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}

export function StoryLandingPage({ isAuthenticated }: StoryLandingPageProps) {
  const hero = useInView<HTMLElement>(0.1);
  const dream = useInView<HTMLElement>(0.2);
  const lie = useInView<HTMLElement>(0.3);
  const busy = useInView<HTMLElement>(0.25);
  const mirror = useInView<HTMLElement>(0.2);
  const awareness = useInView<HTMLElement>(0.2);
  const purpose = useInView<HTMLElement>(0.2);
  const compound = useInView<HTMLElement>(0.2);
  const finale = useInView<HTMLElement>(0.3);

  const [heroFill, setHeroFill] = useState(0);
  const [liePhase, setLiePhase] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setHeroFill(i);
      if (i >= 4) clearInterval(id);
    }, 600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!lie.inView) return;
    const t = setTimeout(() => setLiePhase(1), 1400);
    return () => clearTimeout(t);
  }, [lie.inView]);

  return (
    <div className="story">
      <div className="story-grain" aria-hidden />
      <div className="story-grid" aria-hidden />
      <FloatingParticles />

      {/* Nav */}
      <header className="story-nav">
        <div className="story-container flex items-center justify-between py-5">
          <Link href="/" className="story-display text-lg font-medium tracking-tight text-white">
            DayMirror
          </Link>
          <nav className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link href="/login" className="story-cta-ghost text-sm py-2 px-4">
                Sign in
              </Link>
            )}
            <StoryCta isAuthenticated={isAuthenticated} className="text-sm py-2.5 px-5">
              {isAuthenticated ? "Open tracker" : "Start your first day"}
            </StoryCta>
          </nav>
        </div>
      </header>

      {/* Ch 0 — Hero */}
      <section ref={hero.ref} className="story-chapter story-chapter-hero min-h-dvh">
        <div className="story-aurora story-aurora-hero" aria-hidden />
        <div className="story-container relative z-10 flex min-h-[calc(100dvh-5rem)] flex-col justify-center py-24">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
            <div>
              <h1 className="story-display story-reveal text-[clamp(2.25rem,5vw,4rem)] font-medium leading-[1.08] tracking-tight text-white">
                Your biggest dreams aren&apos;t stolen in a day.
                <br />
                <span className="text-white/55">They&apos;re stolen one unnoticed hour at a time.</span>
              </h1>
              <p className="story-reveal story-reveal-d1 mt-8 max-w-lg text-lg leading-relaxed text-white/45">
                Most people don&apos;t fail from lack of ambition. Time quietly slips away without ever being seen.
                DayMirror is a daily reflection system — not another dashboard.
              </p>
              <div className="story-reveal story-reveal-d2 mt-10 flex flex-wrap items-center gap-4">
                <StoryCta isAuthenticated={isAuthenticated}>Start your first day</StoryCta>
                <a href="#the-lie" className="story-cta-ghost">
                  See how it works
                </a>
              </div>
            </div>
            <div className="story-reveal story-reveal-d3 relative">
              <div className="story-ui-glow" aria-hidden />
              <div className="story-ui-float">
                <StoryTimeline hours={STORY_HOURS.slice(0, 4)} filledCount={heroFill} animateFill />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ch 1 — The Dream */}
      <section ref={dream.ref} className="story-chapter min-h-dvh">
        <div className="story-stars" aria-hidden />
        <div className="story-container flex min-h-dvh flex-col items-center justify-center py-32 text-center">
          <h2
            className={cn(
              "story-display text-[clamp(3rem,8vw,6.5rem)] font-medium leading-none tracking-tight text-white transition-all duration-[1.4s]",
              dream.inView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
            )}
          >
            Everyone has big dreams.
          </h2>
          <div className="mt-20 flex flex-wrap justify-center gap-3 sm:gap-4">
            {DREAMS.map((dreamText, i) => (
              <span
                key={dreamText}
                className={cn(
                  "story-dream-card",
                  dream.inView && "story-dream-card-visible",
                )}
                style={{ transitionDelay: `${0.3 + i * 0.12}s` }}
              >
                {dreamText}
              </span>
            ))}
          </div>
          <p
            className={cn(
              "mt-16 text-sm text-white/30 transition-all duration-1000",
              dream.inView ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDelay: "1s" }}
          >
            Everything feels possible.
          </p>
        </div>
      </section>

      {/* Ch 2 — The Lie */}
      <section id="the-lie" ref={lie.ref} className="story-chapter min-h-dvh">
        <div className="story-aurora story-aurora-rose" aria-hidden />
        <div className="story-container flex min-h-dvh flex-col items-center justify-center py-32 text-center">
          <div className="relative min-h-[5rem] w-full sm:min-h-[6rem]">
            <p
              className={cn(
                "story-display absolute inset-x-0 text-[clamp(2.5rem,6vw,5rem)] font-medium text-white transition-all duration-[1.2s]",
                liePhase === 1 ? "opacity-0 -translate-y-6" : "opacity-100 translate-y-0",
              )}
            >
              I worked all day.
            </p>
            <p
              className={cn(
                "story-display absolute inset-x-0 text-[clamp(2.5rem,6vw,5rem)] font-medium text-white/90 transition-all duration-[1.2s]",
                liePhase === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              )}
            >
              Did you?
            </p>
          </div>

          <div
            className={cn(
              "mt-20 transition-all duration-1000",
              liePhase === 1 ? "opacity-100" : "opacity-0",
            )}
          >
            <HourCounter active={liePhase === 1} />
          </div>
          <p
            className={cn(
              "mt-10 max-w-md text-base text-white/40 transition-all duration-1000",
              liePhase === 1 ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDelay: "0.6s" }}
          >
            Time didn&apos;t disappear. It was spent.
          </p>
        </div>
      </section>

      {/* Ch 3 — Busy ≠ Progress */}
      <section ref={busy.ref} className="story-chapter min-h-dvh">
        <div className="story-container flex min-h-dvh flex-col items-center justify-center py-32">
          <h2 className="story-display text-center text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-tight text-white">
            Motion isn&apos;t progress.
          </h2>

          <div className="relative mt-20 w-full max-w-2xl">
            <div className="flex min-h-[280px] flex-wrap content-start justify-center gap-2 sm:gap-3">
              {DISTRACTIONS.map((item, i) => (
                <span
                  key={item}
                  className={cn("story-distraction-card", busy.inView && "story-distraction-card-visible")}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  {item}
                </span>
              ))}
            </div>
            <div
              className={cn(
                "story-goal-stuck mx-auto mt-12 max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center transition-all duration-1000",
                busy.inView ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDelay: "1.2s" }}
            >
              <p className="text-xs uppercase tracking-widest text-white/35">Your actual goal</p>
              <p className="story-display mt-2 text-4xl font-medium text-white/90">0%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[2%] rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ch 4 — Meet DayMirror */}
      <section ref={mirror.ref} className="story-chapter min-h-dvh">
        <div className="story-aurora story-aurora-blue" aria-hidden />
        <div className="story-container flex min-h-dvh flex-col items-center justify-center py-32 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#5b8def]/80">The Mirror</p>
          <h2 className="story-display mt-6 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1.05] text-white">
            You can&apos;t improve what you never see.
          </h2>
          <p className="mt-6 max-w-lg text-lg text-white/40">
            Every hour becomes visible. Not judged. Visible.
          </p>

          <div
            className={cn(
              "story-ui-showcase relative mt-16 w-full max-w-xl transition-all duration-[1.4s]",
              mirror.inView ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-[0.96]",
            )}
          >
            <div className="story-ui-glow story-ui-glow-lg" aria-hidden />
            <div className="story-ui-float">
              <StoryTimeline hours={STORY_HOURS} filledCount={mirror.inView ? 6 : 0} animateFill={mirror.inView} />
            </div>
          </div>
        </div>
      </section>

      {/* Ch 5 — Awareness */}
      <section ref={awareness.ref} className="story-chapter min-h-dvh">
        <div className="story-container grid min-h-dvh items-center gap-16 py-32 lg:grid-cols-2">
          <div>
            <h2 className="story-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-tight text-white">
              The first win isn&apos;t becoming productive.
              <br />
              <span className="text-white/50">It&apos;s finally seeing the truth.</span>
            </h2>
          </div>
          <div className={cn("transition-all duration-1000", awareness.inView ? "opacity-100" : "opacity-40")}>
            <StoryTimeline
              hours={STORY_HOURS}
              filledCount={awareness.inView ? 6 : 2}
              glowIndex={awareness.inView ? 3 : undefined}
              animateFill={awareness.inView}
            />
          </div>
        </div>
      </section>

      {/* Ch 6 — Small wins (compound start) */}
      <section className="story-chapter py-32">
        <div className="story-container text-center">
          <h2 className="story-display text-[clamp(2rem,5vw,4rem)] font-medium text-white">
            One good hour changes a day.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/40">
            Success isn&apos;t built in months. It&apos;s built one hour at a time.
          </p>
          <div className="mx-auto mt-16 max-w-md">
            <StoryTimeline hours={STORY_HOURS.slice(0, 4)} filledCount={4} glowIndex={0} />
          </div>
        </div>
      </section>

      {/* Ch 7 — Purpose */}
      <section ref={purpose.ref} className="story-chapter min-h-[80vh]">
        <div className="story-container flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
          <h2 className="story-display text-[clamp(2.5rem,5vw,4rem)] font-medium text-white">
            Every hour deserves a purpose.
          </h2>
          <div
            className={cn(
              "story-connect-diagram relative mt-20 w-full max-w-lg transition-all duration-[1.2s]",
              purpose.inView ? "opacity-100" : "opacity-0",
            )}
          >
            <svg viewBox="0 0 400 200" className="w-full text-white/20" aria-hidden>
              <path
                d="M 80 100 Q 200 40 320 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className={cn("story-connect-path", purpose.inView && "story-connect-path-drawn")}
              />
              <path
                d="M 320 100 Q 200 160 80 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className={cn("story-connect-path", purpose.inView && "story-connect-path-drawn")}
                style={{ animationDelay: "0.4s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="story-connect-node">Task</span>
              <span className="story-connect-node story-connect-node-mid">Hour</span>
              <span className="story-connect-node">Goal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ch 8 — Compound */}
      <section ref={compound.ref} className="story-chapter min-h-dvh">
        <div className="story-aurora story-aurora-compound" aria-hidden />
        <div className="story-container flex min-h-dvh flex-col items-center justify-center py-32 text-center">
          <h2 className="story-display text-[clamp(2.5rem,6vw,4.5rem)] font-medium text-white">
            Small hours.
            <br />
            <span className="text-[#3ecf8e]">Massive outcomes.</span>
          </h2>

          <div className="story-zoom-labels mt-16 flex items-center gap-4 text-sm text-white/30">
            {["Day", "Week", "Month", "Year"].map((label, i) => (
              <span
                key={label}
                className={cn(
                  "story-zoom-step",
                  compound.inView && "story-zoom-step-visible",
                )}
                style={{ transitionDelay: `${i * 0.2}s` }}
              >
                {label}
                {i < 3 ? <span className="mx-2 opacity-30">→</span> : null}
              </span>
            ))}
          </div>

          <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={cn("story-stat-card", compound.inView && "story-stat-card-visible")}
                style={{ transitionDelay: `${0.5 + i * 0.1}s` }}
              >
                <p className="story-display text-2xl font-medium text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ch 9 — Finale */}
      <section ref={finale.ref} className="story-chapter story-chapter-finale min-h-dvh">
        <div className="story-container flex min-h-dvh flex-col items-center justify-center py-32 text-center">
          <h2
            className={cn(
              "story-display max-w-4xl text-[clamp(2.25rem,5.5vw,4.5rem)] font-medium leading-[1.1] text-white transition-all duration-[1.4s]",
              finale.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
          >
            One year from now, what story will your hours tell?
          </h2>
          <p
            className={cn(
              "mt-10 max-w-xl text-lg leading-relaxed text-white/40 transition-all duration-1000",
              finale.inView ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDelay: "0.5s" }}
          >
            Would you remember another episode — or the day you finally started building your dream?
          </p>
          <div
            className={cn(
              "mt-14 transition-all duration-1000",
              finale.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: "0.9s" }}
          >
            <StoryCta isAuthenticated={isAuthenticated} className="text-base px-10 py-4">
              Start writing your story
            </StoryCta>
          </div>
        </div>
      </section>

      <footer className="story-footer">
        <div className="story-container flex flex-col items-center justify-between gap-4 py-10 text-sm text-white/30 sm:flex-row">
          <span className="story-display text-white/60">DayMirror</span>
          <span>© {new Date().getFullYear()} — A system that tells you where your life actually went.</span>
        </div>
      </footer>
    </div>
  );
}
