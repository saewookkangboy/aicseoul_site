# Admin interface A→B — design

**Date:** 2026-07-30  
**Status:** Approved (user chose A then B)  
**Source:** `better-interface` full review of Admin console

## Goal

Clear **Block** verdict on Admin by shipping accessibility hotfixes (A), then copy/color consistency (B). No public-site redesign. Preserve PRD 7.1 brand tokens; add only missing semantic roles.

## Scope

| Phase | Findings | In |
| --- | --- | --- |
| **A** | #1–#6, #11 | Mobile nav focus/`inert`, People keyboard reorder, Users disable confirm + hit area, shared `focus-visible`, AuthForm field errors + busy submit, ImageUpload `<label>`, `prefers-reduced-motion` |
| **B** | #7–#10 | `--color-danger` (errors ≠ CTA), KO status/nav display labels, pending/error copy, `error.tsx` on design system |

**Out:** LOW polish (#12–#14), Meetups/Insights form deep redesign, OKLCH migration of locked hex tokens.

## Design decisions

1. **Drawer:** When closed below `lg`, aside is `inert` + `aria-hidden`. On open: focus first focusable in drawer; Esc/backdrop/close restores focus to menu trigger; body scroll lock kept.
2. **People DnD:** Add `@dnd-kit` `KeyboardSensor` with sortable keyboard coordinates; announce save via stable `role="status"`.
3. **Disable user:** Inline confirm (“정말 비활성할까요?” → 확인 / 취소) before `disableUser`; action buttons use min touch-friendly padding (`min-h-10` / py-2 px-2).
4. **Focus:** Shared admin classes use `focus-visible:` rings (match public gold outline pattern); drop mouse-only heavy `focus:` rings on fields where `focus-visible` covers keyboard.
5. **Auth errors:** `aria-invalid` + `aria-describedby` on email/password when `state.error`; submit keeps label, shows busy via `aria-busy` and optional spinner text adjacent—not label replacement alone.
6. **Danger color:** New token `--color-danger` (deep red/ink-safe on cream); errors use it; CTA stays primary actions only.
7. **Copy:** Nav keeps module English where it matches public IA **or** dual: Korean primary with English in muted paren only if needed—prefer Korean display for status (`대기`/`활성`/`비활성`) and roles (`슈퍼관리자`/`운영자`). Nav: `대시보드`, `멤버(People)` optional—**decision:** use Korean primary labels aligned to public section names where natural: People→`멤버`, Meetups→`밋업`, Insights→`인사이트`, keep short.

## Success criteria

- Keyboard-only: open/close mobile menu without tabbing into closed drawer; Escape closes; focus returns.
- Keyboard-only: reorder at least one People row and persist.
- Disable requires explicit confirm; cannot one-click from tiny text.
- Login error announces and focuses/marks fields; contrast of error text uses danger token.
- Admin `error.tsx` uses shared button classes / tokens.

## Non-goals

Changing AUTH_URL/firewall, new design system library, dark mode.
