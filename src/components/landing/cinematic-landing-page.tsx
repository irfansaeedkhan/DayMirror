"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock3,
  Link2,
} from "lucide-react";
import { FilmProductStage } from "@/components/landing/film-product-stage";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type CinematicLandingPageProps = {
  isAuthenticated: boolean;
};

const LOST_DAY = [
  ["8:00", "Coffee", "The day still feels infinite."],
  ["9:00", "Research", "One more tab before starting."],
  ["10:00", "YouTube", "A useful video, apparently."],
  ["11:00", "Messages", "Everyone needed something."],
  ["12:00", "Lunch", "Half the day, somehow."],
  ["1:00", "Another tutorial", "Preparation dressed as progress."],
  ["2:00", "Scrolling", "Just for a minute."],
  ["3:00", "Busy", "Nothing finished."],
  ["4:00", "Still busy", "The important thing untouched."],
  ["5:00", "“I’m exhausted.”", "The goal stayed at zero."],
] as const;

const TIME_SYSTEM = [
  {
    label: "Future",
    name: "Planner",
    line: "Decide what deserves your time.",
    icon: CalendarDays,
  },
  {
    label: "Present",
    name: "Tracker",
    line: "Tell the truth about where it went.",
    icon: Clock3,
  },
  {
    label: "Past",
    name: "Analytics",
    line: "See the life those hours are building.",
    icon: BarChart3,
  },
] as const;

const PURPOSE_TASKS = ["Prepare interview", "Build portfolio", "Message 5 clients"] as const;

function FilmCta({
  isAuthenticated,
  children,
  quiet = false,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
  quiet?: boolean;
}) {
  return (
    <Link
      href={isAuthenticated ? "/tracker" : "/signup"}
      className={quiet ? "film-cta-quiet" : "film-cta"}
    >
      {children}
      <ArrowRight />
    </Link>
  );
}

function FilmParticles() {
  return (
    <div className="film-particles" aria-hidden>
      {Array.from({ length: 28 }, (_, index) => (
        <span
          key={index}
          style={
            {
              "--particle-x": `${(index * 37 + 11) % 97}%`,
              "--particle-y": `${(index * 53 + 7) % 91}%`,
              "--particle-delay": `${(index % 9) * -0.9}s`,
              "--particle-duration": `${8 + (index % 7)}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function HourConstellation({ active }: { active: boolean }) {
  return (
    <div className={cn("film-constellation", active && "is-formed")} aria-hidden>
      <div className="film-constellation-orbit" />
      {Array.from({ length: 24 }, (_, index) => (
        <span
          key={index}
          className="film-hour-particle"
          style={
            {
              "--hour-index": index,
              "--scatter-x": `${((index * 71) % 260) - 130}px`,
              "--scatter-y": `${((index * 43) % 220) - 110}px`,
              "--hour-delay": `${index * 28}ms`,
            } as React.CSSProperties
          }
        />
      ))}
      <div className="film-constellation-center">
        <span>24</span>
        <small>hours</small>
      </div>
    </div>
  );
}

export function CinematicLandingPage({ isAuthenticated }: CinematicLandingPageProps) {
  const { ref: dreamRef, inView: dreamInView } = useInView<HTMLElement>(0.25);
  const { ref: realityRef, inView: realityInView } = useInView<HTMLElement>(0.12);
  const { ref: questionRef, inView: questionInView } = useInView<HTMLElement>(0.4);
  const { ref: mirrorRef, inView: mirrorInView } = useInView<HTMLElement>(0.15);
  const { ref: timeSystemRef, inView: timeSystemInView } = useInView<HTMLElement>(0.2);
  const { ref: purposeRef, inView: purposeInView } = useInView<HTMLElement>(0.2);
  const { ref: growthRef, inView: growthInView } = useInView<HTMLElement>(0.15);
  const { ref: finaleRef, inView: finaleInView } = useInView<HTMLElement>(0.3);

  return (
    <div className="film">
      <div className="film-noise" aria-hidden />
      <div className="film-grid" aria-hidden />
      <FilmParticles />

      <header className="film-nav">
        <div className="film-container">
          <Link href="/" className="film-wordmark">
            DayMirror
          </Link>
          <div className="film-nav-actions">
            {!isAuthenticated ? (
              <Link href="/login" className="film-signin">
                Sign in
              </Link>
            ) : null}
            <FilmCta isAuthenticated={isAuthenticated} quiet>
              {isAuthenticated ? "Open DayMirror" : "Begin"}
            </FilmCta>
          </div>
        </div>
      </header>

      <main>
        <section className="film-hero">
          <div className="film-hero-glow" aria-hidden />
          <div className="film-container film-hero-inner">
            <p className="film-chapter-label film-reveal film-reveal-1">A film about your time</p>
            <h1 className="film-display film-hero-title film-reveal film-reveal-2">
              Your dreams don&apos;t
              <br />
              disappear overnight.
            </h1>
            <p className="film-display film-hero-turn film-reveal film-reveal-3">
              They disappear one unnoticed hour at a time.
            </p>
            <a href="#dream" className="film-scroll-cue film-reveal film-reveal-4">
              <span>Watch a day unfold</span>
              <ArrowDown />
            </a>
          </div>
        </section>

        <section id="dream" ref={dreamRef} className="film-dream film-beat">
          <div className="film-container film-centered">
            <p className="film-chapter-label">Chapter one · Dream</p>
            <h2
              className={cn(
                "film-display film-dream-line",
                dreamInView && "film-visible",
              )}
            >
              “I&apos;ll start tomorrow.”
            </h2>
            <p
              className={cn(
                "film-dream-whisper",
                dreamInView && "film-visible",
              )}
            >
              Tomorrow is generous. It always gives today somewhere to hide.
            </p>
          </div>
        </section>

        <section ref={realityRef} className="film-reality">
          <div className="film-reality-wash" aria-hidden />
          <div className="film-container">
            <div className="film-reality-heading">
              <p className="film-chapter-label">Chapter two · Reality</p>
              <h2 className="film-display">
                A day can feel full
                <br />
                and leave nothing behind.
              </h2>
            </div>

            <div className="film-lost-day">
              <div className="film-lost-line" aria-hidden />
              {LOST_DAY.map(([time, title, note], index) => (
                <div
                  key={time}
                  className={cn("film-lost-hour", realityInView && "film-visible")}
                  style={{ "--lost-index": index } as React.CSSProperties}
                >
                  <time>{time}</time>
                  <span className="film-lost-dot" />
                  <div>
                    <strong>{title}</strong>
                    <p>{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={questionRef} className="film-question film-beat">
          <div className="film-question-vignette" aria-hidden />
          <div className="film-container film-centered">
            <p className="film-question-overline">5:47 PM · Goal progress: 0%</p>
            <h2
              className={cn(
                "film-display film-question-title",
                questionInView && "film-visible",
              )}
            >
              But what actually moved
              <br />
              your life forward?
            </h2>
          </div>
        </section>

        <section ref={mirrorRef} className="film-mirror">
          <div className="film-mirror-aura" aria-hidden />
          <div className="film-container">
            <div className="film-mirror-intro">
              <p className="film-chapter-label">Chapter three · Awareness</p>
              <h2 className="film-display">Meet your mirror.</h2>
              <p>
                Not a coach. Not a guilt machine. A clear record of what happened,
                hour by hour—so tomorrow can be different.
              </p>
            </div>

            <div className="film-product-stage-wrap">
              <FilmProductStage active={mirrorInView} />
            </div>

            <p className="film-product-caption">
              The plan becomes the day. The day becomes evidence.
            </p>
          </div>
        </section>

        <section ref={timeSystemRef} className="film-time-system film-beat">
          <div className="film-container">
            <div className="film-system-heading">
              <p className="film-chapter-label">One continuous story</p>
              <h2 className="film-display">
                Future.
                <br />
                Present.
                <br />
                Reflection.
              </h2>
            </div>

            <div className="film-system-list">
              {TIME_SYSTEM.map(({ label, name, line, icon: Icon }, index) => (
                <div
                  key={name}
                  className={cn("film-system-row", timeSystemInView && "film-visible")}
                  style={{ "--system-index": index } as React.CSSProperties}
                >
                  <span className="film-system-number">0{index + 1}</span>
                  <Icon />
                  <div>
                    <span>{label}</span>
                    <strong>{name}</strong>
                    <p>{line}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={purposeRef} className="film-purpose">
          <div className="film-purpose-glow" aria-hidden />
          <div className="film-container film-centered">
            <p className="film-chapter-label">Chapter four · Purpose</p>
            <h2 className="film-display">Give every hour a reason to exist.</h2>
            <p className="film-purpose-copy">
              A task stops being an intention when it becomes part of an hour.
            </p>

            <div className={cn("film-attach-scene", purposeInView && "film-visible")}>
              <div className="film-task-stack">
                {PURPOSE_TASKS.map((task, index) => (
                  <span key={task} style={{ "--task-index": index } as React.CSSProperties}>
                    {task}
                  </span>
                ))}
              </div>
              <div className="film-attach-line">
                <Link2 />
              </div>
              <div className="film-purpose-hour">
                <small>2:00 PM</small>
                <strong>Portfolio deep work</strong>
                <span>Focused · 91%</span>
              </div>
            </div>
          </div>
        </section>

        <section ref={growthRef} className="film-growth">
          <div className="film-growth-aura" aria-hidden />
          <div className="film-container">
            <div className="film-growth-copy">
              <p className="film-chapter-label">Chapter five · Compound growth</p>
              <h2 className="film-display">
                Every day leaves
                <br />
                a fingerprint.
              </h2>
              <p>
                One honest hour looks small. Repeated, it becomes a week, a month,
                then the shape of a life.
              </p>

              <div className="film-growth-scale">
                {["Day", "Week", "Month", "Year"].map((label, index) => (
                  <span
                    key={label}
                    className={growthInView ? "film-visible" : undefined}
                    style={{ "--scale-index": index } as React.CSSProperties}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <HourConstellation active={growthInView} />
          </div>
        </section>

        <section ref={finaleRef} className="film-finale film-beat">
          <div className="film-finale-horizon" aria-hidden />
          <div className="film-container film-centered">
            <p className="film-chapter-label">Your future self is watching</p>
            <h2
              className={cn(
                "film-display film-finale-title",
                finaleInView && "film-visible",
              )}
            >
              One year from now,
              <br />
              what story will your hours tell?
            </h2>
            <p className="film-finale-copy">
              Don&apos;t manage more. Notice what matters—and return to it.
            </p>
            <div className="film-finale-action">
              <FilmCta isAuthenticated={isAuthenticated}>
                {isAuthenticated ? "Open your mirror" : "Write your first day"}
              </FilmCta>
              <span>No streak pressure. No performative productivity.</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="film-footer">
        <div className="film-container">
          <span className="film-wordmark">DayMirror</span>
          <span>Plan the future. Witness the present. Understand the past.</span>
        </div>
      </footer>
    </div>
  );
}
