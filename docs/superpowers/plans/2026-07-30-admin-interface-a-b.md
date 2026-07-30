# Admin Interface A→B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Admin accessibility hotfixes (A) then copy/color consistency (B) per `docs/superpowers/specs/2026-07-30-admin-interface-a11y-design.md`.

**Architecture:** Fix shared Admin primitives and high-traffic surfaces (nav, auth form, users/people tables, tokens, error boundary) without redesigning public site or CMS form deep UI.

**Tech Stack:** Next.js App Router, Tailwind v4, CSS tokens, Phosphor, `@dnd-kit`, React `useActionState` / `useTransition`.

## Global Constraints

- Preserve PRD 7.1 locked brand tokens; add `--color-danger` only.
- Match existing Admin class tokens in `src/components/admin/ui/classes.ts`.
- Korean UI copy; status/role display labels localized.
- Feature branch + PR; no force-push to main.
- Do not expand into LOW findings (#12–#14).

---

## File map

| File | Responsibility |
| --- | --- |
| `src/styles/tokens.css` | `--color-danger` |
| `src/app/globals.css` | Theme expose danger if needed |
| `src/components/admin/ui/classes.ts` | `focus-visible` on fields/buttons |
| `src/components/admin/AdminNav.tsx` | Drawer inert/focus trap/restore + reduced motion |
| `src/components/admin/AuthForm.tsx` | aria-invalid/describedby, busy submit, danger error |
| `src/components/admin/ImageUploadField.tsx` | Proper label association, danger errors |
| `src/components/admin/people/PeopleSortableTable.tsx` | KeyboardSensor + status region |
| `src/components/admin/UsersTable.tsx` | Confirm disable, hit areas, KO labels |
| `src/components/admin/ui/AdminBadge.tsx` | (optional) no hex change in B unless trivial |
| `src/app/admin/error.tsx` | Design-system buttons/copy |
| `src/app/admin/(auth)/pending/page.tsx` | Clearer waiting copy |
| `src/components/admin/AdminNav.tsx` | KO nav labels |

---

### Task 1: Tokens + shared focus classes

**Files:** `tokens.css`, `globals.css`, `classes.ts`

- [ ] Add `--color-danger` (readable on cream/surface, distinct from CTA orange).
- [ ] Expose in `@theme inline` if other colors are.
- [ ] Update `fieldClass` / button classes to `focus-visible:` gold ring; keep `outline-none` only with replacement.
- [ ] Add utility note: error text classes should use danger (consumers in later tasks).

**Verify:** Visual spot-check not required yet; TypeScript/compile later.

---

### Task 2: AdminNav drawer a11y + reduced motion

**Files:** `AdminNav.tsx`

- [ ] Ref menu button; on open focus first focusable in aside; on close restore focus.
- [ ] When `!open` and mobile: set `inert` on aside (and `aria-hidden`).
- [ ] Optional focus trap: Tab cycles within open drawer (minimal: prevent tab into main while open via inert on main sibling—if hard, at least inert closed drawer + Escape).
- [ ] Wrap transform transition in `motion-safe:` / `@media (prefers-reduced-motion: no-preference)` pattern (Tailwind `motion-reduce:transition-none motion-reduce:transform-none`).

**Verify:** Manual keyboard notes in PR; `pnpm lint` on file.

---

### Task 3: People keyboard DnD

**Files:** `PeopleSortableTable.tsx`

- [ ] Import `KeyboardSensor`, `sortableKeyboardCoordinates`, `useSensor` both pointer+keyboard.
- [ ] Stable `role="status"` region for “순서 저장 중…”.
- [ ] Ensure drag handle remains keyboard-activatable via dnd-kit attributes.

**Verify:** Typecheck; manual Space/arrow if possible.

---

### Task 4: UsersTable confirm + hit areas + KO labels (partial B)

**Files:** `UsersTable.tsx`

- [ ] Local state `confirmDisableId`; first click asks confirm; second confirms.
- [ ] Enlarge action buttons (`min-h-10`, padding).
- [ ] Map status/role to Korean display strings.

**Verify:** Lint.

---

### Task 5: AuthForm + ImageUpload a11y

**Files:** `AuthForm.tsx`, `ImageUploadField.tsx`

- [ ] Error id + `aria-describedby` / `aria-invalid` on fields when error.
- [ ] Submit: keep `submitLabel`, show pending with `aria-busy` and “처리 중…” as supplementary or aria-live—do not strip accessible name of action.
- [ ] Image upload: associate label with file input via `htmlFor`/`id`.
- [ ] Error text → danger token.

**Verify:** Login page snapshot optional.

---

### Task 6: B copy + error page

**Files:** `AdminNav.tsx` labels, `pending/page.tsx`, `error.tsx`, remaining danger usages in admin upload/archive alerts

- [ ] Nav Korean labels per spec.
- [ ] Pending: clearer expectation copy.
- [ ] `error.tsx`: Admin tokens + `btnPrimaryClass` / `btnSecondaryClass`, calmer copy.
- [ ] Grep admin for `text-[var(--color-cta)]` on errors → danger.

**Verify:** `pnpm test` + `pnpm lint` (or project equivalents).

---

### Task 7: Ship

- [ ] Commit on `fix/admin-interface-a-b`.
- [ ] Open PR summarizing A→B checklist.
