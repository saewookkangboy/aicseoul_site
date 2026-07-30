# Admin 멤버 사진 업로드 · 얼굴 3:4 크롭 · MediaAsset — Design Spec

- 작성일: 2026-07-30
- 상태: **approved** (2026-07-30 사용자 설계 승인)
- 플랜: (writing-plans 후 연결)
- 관련: `Member.photoUrl`, `MediaAsset`, `/api/admin/upload`, Cloudinary, P4/P5 미디어, PRD People 3:4

## 1. 문제

Admin People 추가/편집에서 사진은 `ImageUploadField` → Cloudinary(또는 로컬) 업로드 후 `Member.photoUrl` URL만 저장한다. PRD·콘텐츠 가이드는 **3:4**를 요구하지만 크롭 UI가 없고, 퍼블릭은 CSS `object-cover`에만 의존한다. 얼굴 중앙 정렬·업로드 진행률·jpg/png·용량 제한이 약하며, 미사용 `MediaAsset` 테이블로 메타데이터를 추적하지 않는다. Supabase는 Postgres 호스팅만 쓰고 Storage는 없다.

## 2. 목표

1. **하이브리드 스토리지:** 파일은 Cloudinary(프로덕션) / 로컬(개발), 메타는 Supabase Postgres의 `MediaAsset`.
2. **People:** MediaPipe 얼굴 감지 → 3:4 자동 배치 → 수동 미세 조정 → 최종 JPEG 업로드.
3. **공유 업로드 UX:** 전 Admin 이미지 업로드에 **진행률 표시** + **jpg/png · 5MB** 제한.
4. **DB:** `MediaAsset` 활성화 + `Member.photoAssetId` FK. `photoUrl`은 표시용으로 유지.

## 3. 확정 요구사항

| 항목 | 결정 |
|---|---|
| 스토리지 | Cloudinary + Postgres `MediaAsset` (Supabase Storage 미사용) |
| 크롭 전략 | 클라이언트에서 최종본 생성 후 업로드 (원본 미보관) |
| 얼굴 정렬 | MediaPipe Face Detector + 수동 드래그/줌 |
| 얼굴 미검출 | 이미지 중앙 기본값 + 경고(차단 아님) |
| 적용 범위 | 공유 업로드(진행률·제한) 전체 / 얼굴 3:4는 People만 |
| 포맷 | `image/jpeg`, `image/png`만 (webp/gif 거부) |
| 용량 | 최대 **5MB** (서버·클라이언트 동일) |
| DB | `MediaAsset` 확장 + `Member.photoAssetId` |
| API | 기존 `POST /api/admin/upload` 강화 |

## 4. 비범위

- Supabase Storage 전환
- Classes / Insights / Archive 비율 크롭 UI
- 원본 보관 및 재크롭
- 기존 Cloudinary URL → `MediaAsset` 일괄 백필
- gif / webp 재허용
- Auth·권한 모델 변경

## 5. 아키텍처

```
Admin ImageUploadField
  ├─ 공통: jpg/png·5MB 검증 → XHR 업로드 + 진행률
  └─ People(cropMode=face-3x4):
       FaceCropModal (MediaPipe → 3:4 조정 → JPEG blob)
         → POST /api/admin/upload
         → getMediaUploader() (Cloudinary | local)
         → Prisma MediaAsset.create
         → { url, assetId, publicId, width, height, ... }
         → Member.photoUrl + Member.photoAssetId
```

| 단위 | 책임 |
|---|---|
| `MediaAsset` (Prisma) | 업로드 메타 원장 |
| `Member.photoAssetId` | 표시 URL과 에셋 연결 (nullable) |
| `src/lib/security/upload.ts` | MIME·용량 가드 (5MB, jpeg/png) |
| `POST /api/admin/upload` | auth·rate limit·upload·MediaAsset INSERT |
| `src/lib/media/upload-client.ts` | XHR 진행률 헬퍼 (클라이언트) |
| `ImageUploadField` | 공유 UI: 검증·진행률·미리보기 |
| `FaceCropModal` + crop geometry | People 전용 3:4·얼굴 중앙 |
| `MemberForm` | `photoUrl` / `photoAssetId` 제출 |
| `ArchiveManager` 등 | 동일 업로드 헬퍼로 통일 |

## 6. 데이터 모델

### 6.1 `MediaAsset` (확장)

기존: `id`, `url`, `publicId?`, `width?`, `height?`, `alt?`, `createdAt`.

추가:

| 필드 | 타입 | 설명 |
|---|---|---|
| `module` | `String` | `people` \| `meetups` \| `insights` \| `settings` \| `archive` |
| `folder` | `String?` | Cloudinary/local folder |
| `mimeType` | `String?` | `image/jpeg` \| `image/png` (저장 시점 입력 MIME) |
| `byteSize` | `Int?` | 업로드 바이트 |
| `uploadedById` | `String?` | FK → `User`, `onDelete: SetNull` |

인덱스: `(module, createdAt)`. `publicId`는 unique 강제하지 않음(로컬 업로더는 null 가능, 교체·재시도 단순화).

RLS: 기존 Data API lockdown 유지. Prisma `aic_app`만 접근. 신규 컬럼은 Supabase 미러 마이그레이션에 반영.

### 6.2 `Member` (확장)

| 필드 | 설명 |
|---|---|
| `photoUrl` | 유지 — 퍼블릭·Admin 표시 URL |
| `photoAssetId` | `String?` FK → `MediaAsset`, `onDelete: SetNull` |

기존 멤버: `photoAssetId = null`, `photoUrl`만으로 계속 표시.

### 6.3 관계 규칙

- 업로드마다 `MediaAsset` 1행 생성 (교체 업로드 시 이전 row orphan 허용 — 챕터 규모 YAGNI; 삭제는 비범위).
- `Member` 저장 시 `photoUrl`과 `photoAssetId`를 함께 갱신. URL만 있고 assetId 없는 레거시는 허용.

## 7. 업로드·검증 API

**엔드포인트:** `POST /api/admin/upload` (변경만, 경로 유지)

**요청:** `multipart/form-data` — `file`, `module`, `folder?`

**서버 검증 (최종):**

| 항목 | 값 |
|---|---|
| MIME | `image/jpeg`, `image/png` |
| 크기 | ≤ 5MB |
| 기타 | 기존 auth · module permission · rate limit |

**처리 순서:** auth → rate limit → permission → `assertImageUpload` → uploader.upload → `MediaAsset.create` → JSON.

**응답:**

```json
{
  "url": "https://res.cloudinary.com/...",
  "assetId": "clxxx...",
  "publicId": "aic-seoul/people/...",
  "width": 900,
  "height": 1200,
  "mimeType": "image/jpeg",
  "byteSize": 245678
}
```

`url` 필드는 하위 호환 유지. Cloudinary/local의 WebP 변환 등 기존 업로더 후처리는 유지하되, **입력 허용 MIME는 jpeg/png만**.

## 8. UI

### 8.1 공유 `ImageUploadField`

- `accept="image/jpeg,image/png"`
- 선택 직후 클라이언트 검증 (포맷·5MB)
- `XMLHttpRequest` + `upload.onprogress` → 진행률 바 + %
- 상태: idle / uploading(N%) / done / error
- `onUploaded(url)` 유지; `onUploadedMeta?`로 assetId 등 전달
- 직접 `fetch`하던 `ArchiveManager` 등은 동일 클라이언트 헬퍼 사용

### 8.2 People `FaceCropModal` (`cropMode="face-3x4"`)

1. 검증 통과 후 모달 오픈
2. MediaPipe Face Detector로 얼굴 박스 → 3:4 crop rect를 얼굴 중심 배치
3. 미검출: 이미지 중앙 + 안내
4. 드래그/줌 미세 조정
5. 적용 → canvas → JPEG (~0.92 quality) blob
6. 공유 업로드 경로로 전송
7. `MemberForm`: hidden `photoUrl` + `photoAssetId`

Admin 미리보기: **3:4** 프레임. 라벨: 「사진 (3:4, 얼굴 중앙 자동 정렬)」.

### 8.3 접근성

- 진행률 `role="status"`
- 에러 `role="alert"`
- 모달: 포커스 트랩, Esc 닫기, 적절한 `aria-*`

## 9. 테스트 · 롤아웃

### 테스트

- 단위: `assertImageUpload` — jpeg/png 허용, webp/gif 거부, 5MB 경계
- 단위: 얼굴 박스 → 3:4 rect 기하, 미검출 시 중앙
- API: 성공 시 `MediaAsset` 생성·응답 필드; 권한·rate limit 회귀
- 수동: People 얼굴/무인물/진행률/용량 초과

### 롤아웃

1. Prisma + Supabase 미러 마이그레이션
2. upload security + API + MediaAsset write
3. 클라이언트 업로드 헬퍼 + `ImageUploadField` + Archive 통일
4. `FaceCropModal` + `MemberForm` / CMS actions
5. feature branch + PR

### 성공 기준

- People에서 얼굴이 대략 중앙인 3:4 이미지가 업로드·표시된다
- 모든 Admin 이미지 업로드에 진행률·jpg/png·5MB가 적용된다
- 업로드마다 `MediaAsset` row가 생성된다
- 레거시 `photoUrl`만 있는 멤버가 깨지지 않는다

## 10. 의존성

- `@mediapipe/tasks-vision` — Face Detector (People 크롭만, CDN/wasm 모델 로드)
- `react-easy-crop` — 3:4 크롭 프레임·드래그/줌 UI
- 기존 유지: `cloudinary`, `sharp`, Prisma, Auth.js
