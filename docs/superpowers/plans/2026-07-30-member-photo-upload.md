# Member Photo Upload · Face 3:4 Crop · MediaAsset — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin 이미지 업로드에 jpg/png·5MB·진행률·MediaAsset 기록을 넣고, People만 얼굴 중앙 3:4 크롭을 적용한다.

**Architecture:** 클라이언트에서 People 최종 JPEG를 만든 뒤 XHR로 `/api/admin/upload`에 올리고, Cloudinary/local 저장 후 Prisma `MediaAsset`를 생성한다. `Member.photoUrl` + `photoAssetId`로 연결한다.

**Tech Stack:** Prisma, Supabase Postgres, Cloudinary, sharp, `@mediapipe/tasks-vision`, `react-easy-crop`, Next.js App Router

## Global Constraints

- 입력 MIME: `image/jpeg`, `image/png` only
- Max size: `5 * 1024 * 1024` bytes
- Face 3:4 crop: People module only (`cropMode="face-3x4"`)
- Storage: Cloudinary (prod) / local disk (dev); Supabase Storage not used
- Keep `photoUrl` display path; `photoAssetId` nullable for legacy rows
- Feature branch + PR; do not commit on `main` for implementation commits

## File map

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | `MediaAsset` fields + `Member.photoAssetId` |
| `prisma/migrations/...` | SQL migration |
| `supabase/migrations/...` | Mirror ALTER for remote schema |
| `src/lib/security/upload.ts` | MIME + 5MB guard |
| `src/lib/security/upload.test.ts` | Unit tests |
| `src/app/api/admin/upload/route.ts` | Persist `MediaAsset`, extended JSON |
| `src/lib/media/upload-client.ts` | XHR progress helper |
| `src/lib/media/face-crop.ts` | Pure geometry: face box → 3:4 rect |
| `src/lib/media/face-crop.test.ts` | Geometry tests |
| `src/components/admin/ImageUploadField.tsx` | Shared UI + progress + optional crop |
| `src/components/admin/people/FaceCropModal.tsx` | MediaPipe + react-easy-crop |
| `src/components/admin/people/MemberForm.tsx` | photoUrl + photoAssetId |
| `src/lib/actions/cms.ts` | Persist photoAssetId |
| `src/components/admin/meetups/ArchiveManager.tsx` | Shared upload helper + limits |

---

### Task 1: Schema — MediaAsset + Member.photoAssetId

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_media_asset_member_photo/migration.sql`
- Create: `supabase/migrations/<timestamp>_media_asset_member_photo.sql`

**Interfaces:**
- Produces: `MediaAsset.module`, `.folder`, `.mimeType`, `.byteSize`, `.uploadedById`; `Member.photoAssetId`

- [ ] **Step 1:** Update Prisma models:

```prisma
model Member {
  // ...existing fields...
  photoUrl     String?
  photoAssetId String?
  photoAsset   MediaAsset? @relation(fields: [photoAssetId], references: [id], onDelete: SetNull)
  // ...
}

model MediaAsset {
  id           String   @id @default(cuid())
  url          String
  publicId     String?
  width        Int?
  height       Int?
  alt          String?
  module       String?
  folder       String?
  mimeType     String?
  byteSize     Int?
  uploadedById String?
  uploadedBy   User?    @relation(fields: [uploadedById], references: [id], onDelete: SetNull)
  createdAt    DateTime @default(now())
  members      Member[]

  @@index([module, createdAt])
}

model User {
  // add:
  mediaAssets MediaAsset[]
}
```

- [ ] **Step 2:** `npx prisma migrate dev --name media_asset_member_photo` (or create SQL by hand if DB unavailable) and mirror ALTER in `supabase/migrations/`.

- [ ] **Step 3:** Commit `feat(db): MediaAsset metadata + Member.photoAssetId`

---

### Task 2: Upload guards — jpg/png · 5MB

**Files:**
- Modify: `src/lib/security/upload.ts`
- Modify: `src/lib/security/upload.test.ts`

**Interfaces:**
- Produces: `MAX_UPLOAD_BYTES = 5 * 1024 * 1024`; `ALLOWED` = jpeg+png; error messages mention `5MB`

- [ ] **Step 1:** Update tests to expect 5MB and reject webp/gif; fail against old 8MB/webp behavior.

- [ ] **Step 2:** Implement:

```ts
const ALLOWED = new Set(["image/jpeg", "image/png"]);
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
```

- [ ] **Step 3:** `npm test` — upload tests pass.

- [ ] **Step 4:** Commit `fix(security): restrict uploads to jpeg/png 5MB`

---

### Task 3: Upload API writes MediaAsset

**Files:**
- Modify: `src/app/api/admin/upload/route.ts`

**Interfaces:**
- Consumes: `getMediaUploader()`, `assertImageUpload` (via uploader), `prisma`
- Produces JSON: `{ url, assetId, publicId?, width?, height?, mimeType, byteSize }`

- [ ] **Step 1:** After successful `uploader.upload`, create MediaAsset with module/folder/mime/size/userId; return extended JSON including `assetId`.

- [ ] **Step 2:** Manual or unit smoke if available; keep 401/403/429/503 behavior.

- [ ] **Step 3:** Commit `feat(api): persist MediaAsset on admin upload`

---

### Task 4: Client XHR upload helper

**Files:**
- Create: `src/lib/media/upload-client.ts`

**Interfaces:**
- Produces: `uploadAdminImage({ file, module, folder?, onProgress? }) => Promise<UploadResult>`
- `UploadResult`: `{ url, assetId, publicId?, width?, height?, mimeType, byteSize }`
- Client-side precheck using same MIME/size constants (re-export from upload.ts or duplicate safe constants for client — prefer importing `MAX_UPLOAD_BYTES` + shared allowlist if tree-shake safe; else `src/lib/media/upload-constraints.ts` shared)

- [ ] **Step 1:** Implement XHR FormData POST with `upload.onprogress`.

- [ ] **Step 2:** Commit `feat(media): client upload helper with progress`

---

### Task 5: Shared ImageUploadField

**Files:**
- Modify: `src/components/admin/ImageUploadField.tsx`

**Interfaces:**
- Props: existing + `cropMode?: "none" | "face-3x4"`; `onUploadedMeta?: (meta: UploadResult) => void`
- People passes `cropMode="face-3x4"`

- [ ] **Step 1:** Wire validation, progress bar, accept jpeg/png, call upload helper; if face-3x4, open FaceCropModal first (Task 6/7).

- [ ] **Step 2:** Commit `feat(admin): ImageUploadField progress and limits`

---

### Task 6: Face crop geometry (pure)

**Files:**
- Create: `src/lib/media/face-crop.ts`
- Create: `src/lib/media/face-crop.test.ts`

**Interfaces:**
- `type Rect = { x: number; y: number; width: number; height: number }`
- `computeFaceCenteredCrop(image: { width: number; height: number }, face?: Rect | null): Rect` — returns max 3:4 rect inside image, centered on face center or image center

- [ ] **Step 1:** Write failing tests (face center, no face, clamp to bounds).

- [ ] **Step 2:** Implement; `npm test` pass.

- [ ] **Step 3:** Commit `feat(media): 3:4 face-centered crop geometry`

---

### Task 7: FaceCropModal + deps

**Files:**
- Create: `src/components/admin/people/FaceCropModal.tsx`
- Modify: `package.json` — add `@mediapipe/tasks-vision`, `react-easy-crop`

**Interfaces:**
- Props: `{ file: File; open: boolean; onCancel: () => void; onCropped: (blob: Blob) => void }`
- Loads face detector, sets initial crop via `computeFaceCenteredCrop`, user adjusts, exports JPEG blob quality 0.92

- [ ] **Step 1:** `pnpm add @mediapipe/tasks-vision react-easy-crop`

- [ ] **Step 2:** Implement modal with a11y (dialog, Esc, focus).

- [ ] **Step 3:** Commit `feat(admin): FaceCropModal with MediaPipe + easy-crop`

---

### Task 8: MemberForm + CMS actions

**Files:**
- Modify: `src/components/admin/people/MemberForm.tsx`
- Modify: `src/lib/actions/cms.ts`
- Modify: edit/new pages if they pass initial (photoAssetId optional)

**Interfaces:**
- Form hidden: `photoUrl`, `photoAssetId`
- Schema: `photoAssetId: z.string().optional()`

- [ ] **Step 1:** Wire cropMode + onUploadedMeta; persist both fields on create/update.

- [ ] **Step 2:** Commit `feat(admin): save Member photoAssetId`

---

### Task 9: ArchiveManager + polish polish

**Files:**
- Modify: `src/components/admin/meetups/ArchiveManager.tsx`
- Modify: `docs/superpowers/specs/2026-07-30-member-photo-upload-design.md` (plan link)

**Interfaces:**
- Uses `uploadAdminImage` with progress text; accept jpeg/png; 5MB client check

- [ ] **Step 1:** Replace raw fetch; show per-file or overall progress.

- [ ] **Step 2:** Update spec plan link; run `npm test` and targeted typecheck.

- [ ] **Step 3:** Commit `feat(admin): archive uploads use shared helper`

---

## Self-review

- Spec coverage: hybrid storage, face crop, progress, limits, MediaAsset, Member FK, tests, out-of-scope respected
- No TBD placeholders in task steps
- Types: `UploadResult.assetId` matches API `assetId` and form `photoAssetId`
