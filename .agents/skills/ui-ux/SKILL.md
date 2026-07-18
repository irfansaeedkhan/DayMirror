---
name: ui-ux-workflow
description: Master workflow for Chronos UI/UX tasks. Read this FIRST, then load skills in order. Covers design intelligence, aesthetics, audits, React patterns, and accessibility.
---

# UI/UX Skills Hub — Chronos

**Always read this file before any UI/UX work.** Then load skills in the order below.

## Project context (read first)

1. `chronos/DESIGN-ETHICS.md` — calm, premium, Sunsama-aligned
2. `chronos/src/app/globals.css` — all theme/mood colors (`var(--*)`)

## Skill load order

| # | Skill | Path | When |
|---|-------|------|------|
| 1 | **UI/UX Pro Max** | `../ui-ux-pro-max/SKILL.md` | Design decisions, palettes, layout, forms, search bars, drawers |
| 2 | **Anthropic Frontend Design** | `../frontend-design/SKILL.md` | Visual direction, hierarchy, action affordance |
| 3 | **Bencium UX Designer** | `../bencium-controlled-ux-designer/SKILL.md` | Accessibility, responsive, motion specs |
| 4 | **Vercel Web Design Guidelines** | `../web-design-guidelines/SKILL.md` | Audit UI against 100+ UX/a11y rules |
| 5 | **Vercel React Best Practices** | `../vercel-react-best-practices/SKILL.md` | Performance when UI touches data/renders |
| 6 | **Vercel Composition Patterns** | `../vercel-composition-patterns/SKILL.md` | Component architecture refactors |
| 7 | **AccessLint** | `../accesslint/audit/SKILL.md` | WCAG contrast, keyboard, a11y fixes |
| 8 | **Vercel React Native Skills** | `../vercel-react-native-skills/SKILL.md` | Only for mobile/React Native work |

## Run UI/UX Pro Max scripts

From `chronos/` directory:

```bash
# Design system for a product type
python .agents/skills/ui-ux-pro-max/scripts/search.py "productivity tracker dashboard" --design-system -p "Chronos"

# UX guidelines for a component type
python .agents/skills/ui-ux-pro-max/scripts/search.py "search input drawer" --domain ux

# Stack-specific (Next.js + shadcn)
python .agents/skills/ui-ux-pro-max/scripts/search.py "sheet drawer search" --stack nextjs
python .agents/skills/ui-ux-pro-max/scripts/search.py "command input" --stack shadcn
```

## Action-button hierarchy (Chronos)

- **Chips** (mood, tags): `text-[11px]`, `rounded-full`, `bg-secondary`
- **Tertiary actions** (attach, link): `h-7`, `font-semibold`, `text-foreground`, `border` + `bg-card` + `shadow-elevated`
- **Primary CTAs** (save, create): one per section — confident fill button

## Constraints

- Do not change unrelated UI unless user asks
- No raw hex in components — use `globals.css` variables only
- Do not alter hourly input card styling without explicit permission
