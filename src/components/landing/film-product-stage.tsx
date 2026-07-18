"use client";

import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Link2,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = [
  { time: "9:00 AM", text: "Deep work on portfolio", mood: "Focused", score: "92%", task: "Ship case study" },
  { time: "10:00 AM", text: "JavaScript interview prep", mood: "Learning", score: "84%", task: "Async patterns" },
  { time: "11:00 AM", text: "Client outreach", mood: "Progress", score: "76%", task: "5 conversations" },
  { time: "12:00 PM", text: "Lunch without the feed", mood: "Present", score: "—", task: null },
] as const;

const NAV_ITEMS = [
  { label: "Planner", icon: CalendarDays, active: false },
  { label: "Tracker", icon: Clock3, active: true },
  { label: "Analytics", icon: BarChart3, active: false },
] as const;

export function FilmProductStage({ active = false }: { active?: boolean }) {
  return (
    <div className={cn("film-product-frame", active && "film-product-frame-active")}>
      <div className="film-product-shine" aria-hidden />
      <div className="film-product-app">
        <aside className="film-product-sidebar">
          <div className="film-product-brand">
            <span className="film-product-mark">D</span>
            <span>DayMirror</span>
          </div>

          <p className="film-product-kicker">Workspace</p>
          <div className="film-product-nav">
            {NAV_ITEMS.map(({ label, icon: Icon, ...item }) => (
              <div key={label} className={cn("film-product-nav-item", item.active && "is-active")}>
                <Icon />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="film-product-upgrade">
            <Sparkles />
            <strong>Build with intention</strong>
            <span>Your hours become the evidence.</span>
          </div>
        </aside>

        <div className="film-product-main">
          <div className="film-product-topbar">
            <span className="film-product-breadcrumb">DayMirror / Tracker</span>
            <span className="film-product-action" aria-hidden>
              <Plus />
              New
              <ChevronDown />
            </span>
          </div>

          <div className="film-product-content">
            <div className="film-product-heading">
              <div>
                <p className="film-product-eyebrow">Saturday, July 18</p>
                <h3>The day, as it actually happened.</h3>
              </div>
              <div className="film-product-metrics">
                <span>82 day score</span>
                <span>3 meaningful hours</span>
                <span>4 linked tasks</span>
              </div>
            </div>

            <div className="film-product-sessionbar">
              <div>
                <span>Session</span>
                <strong>My day · 9 AM – 5 PM</strong>
              </div>
              <span className="film-product-action" aria-hidden>
                <SlidersHorizontal />
                Edit
              </span>
            </div>

            <div className="film-product-hours">
              {HOURS.map((hour, index) => (
                <div
                  key={hour.time}
                  className="film-product-hour"
                  style={{ "--film-row": index } as React.CSSProperties}
                >
                  <div className="film-product-time">
                    <span className="film-product-dot" />
                    {hour.time}
                  </div>
                  <div className="film-product-entry">
                    <div className="film-product-entry-copy">
                      <strong>{hour.text}</strong>
                      <span>{hour.mood}</span>
                    </div>
                    <span className="film-product-score">{hour.score}</span>
                    {hour.task ? (
                      <span className="film-product-task">
                        <Link2 />
                        {hour.task}
                      </span>
                    ) : (
                      <span className="film-product-checked">
                        <Check />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
