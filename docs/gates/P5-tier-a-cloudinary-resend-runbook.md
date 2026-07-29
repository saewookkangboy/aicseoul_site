# P5 — Tier A · Cloudinary · Resend 진행 런북

- 작성일: 2026-07-30
- 상태: **ready_for_operator** (코드 준비됨 · 계정·콘텐츠·env는 운영자)
- 목적: 소프트 런치 전 **콘텐츠(Tier A) + 이미지(CDN) + 문의 메일**만 이 문서로 끝낸다
- 제외: 커스텀 도메인 DNS, Turnstile, Gemini 키 (별도)

관련 문서:

| 문서 | 역할 |
|---|---|
| 본 런북 | **실행 순서 · 체크 · 완료 트리거** |
| [P5-tier-a-checklist.md](./P5-tier-a-checklist.md) | 자료 수집 체크리스트 (원본) |
| [P5-content-guide.md](./P5-content-guide.md) | 필드·이미지 스펙 상세 |
| [P5-vercel-setup.md](./P5-vercel-setup.md) | Vercel 프로젝트·필수 env |
| [P5-plan.md](./P5-plan.md) | 출시 계획·스모크 |

담당: _______________ · 목표일: _______________

---

## 0. 권장 순서 (병렬 가능)

```
Track C  Cloudinary 계정·Vercel env     ─┐
Track R  Resend 계정·Vercel env         ─┼─→ Track A Admin 적재(사진 업로드) ─→ 「Tier A 준비 완료」
Track A  텍스트·사진 수집(로컬 준비)     ─┘
```

| Track | 블로커 여부 | 없으면 |
|---|---|---|
| **C Cloudinary** | 프로덕션 **강력 권장** | Vercel 재배포 시 `public/uploads` 유실 가능 |
| **R Resend** | 선택(권장) | Contact는 DB Inbox만, 메일 알림 없음 |
| **A Tier A** | **소프트 런치 블로커** | People/사진벽/Insights가 비어 공개 불가에 가까움 |

코드는 이미 Cloudinary/Resend 없이도 동작한다(로컬 업로드·알림 스킵). **공개 URL에 올릴 때는 C+A를 사실상 필수**로 본다.

---

## Track C — Cloudinary

### C1. 계정

1. [Cloudinary](https://cloudinary.com/) 가입 (Free면 충분)
2. Dashboard → **Account Details** / API Keys에서 값 확인  
   - Cloud name  
   - API Key  
   - API Secret  

### C2. Vercel env (Production + Preview 권장)

프로젝트: `aicseoul-site` (팀 `chunghyos-projects`)

| Key | 값 |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Dashboard cloud name |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | **Secret** — Git에 넣지 말 것 |
| `CLOUDINARY_FOLDER` | `aic-seoul` (권장) |

저장 후 **Redeploy** Production (env는 다음 배포부터 적용).

### C3. 스모크

1. `/admin/login` → People 또는 Archive에서 이미지 1장 업로드  
2. 응답/필드 URL이 `https://res.cloudinary.com/...` 인지 확인  
3. 퍼블릭 `/ko/people` 또는 `/ko/meetups`에서 이미지 표시 확인  

폴더 관례 (가이드와 동일):

| 용도 | 폴더 힌트 |
|---|---|
| People | `aic-seoul/people` |
| Archive | `aic-seoul/archive` |
| Insights 썸네일 | `aic-seoul/insights` |
| Class 사진 | `aic-seoul/classes` |

### C 체크

- [ ] Cloudinary 계정 생성  
- [ ] Vercel Production에 4키 등록  
- [ ] Redeploy 완료  
- [ ] Admin 업로드 → Cloudinary URL 확인  

---

## Track R — Resend

### R1. 계정

1. [Resend](https://resend.com/) 가입  
2. API Key 발급  
3. **From 주소**  
   - 도메인 미인증: `AIC Seoul <onboarding@resend.dev>` (Resend 테스트 발신)  
   - 수신: Resend가 허용한 본인/팀 메일만 (샌드박스 제한)  
4. 도메인 확정 후: 도메인 인증 → `RESEND_FROM`을 실발신으로 교체  

### R2. Vercel env

| Key | 값 | 비고 |
|---|---|---|
| `RESEND_API_KEY` | `re_…` | Secret |
| `RESEND_FROM` | `AIC Seoul <onboarding@resend.dev>` | 도메인 전 기본 |
| `NOTIFY_EMAILS` | `ops1@…,ops2@…` | 비우면 SiteSetting `contact.email` 사용 |

Redeploy 후 적용.

### R3. 스모크

1. 퍼블릭 `/ko/contact`에서 테스트 문의 1건 제출  
2. Admin `/admin/contact` Inbox에 행 생성 확인  
3. `NOTIFY_EMAILS`(또는 contact.email) 수신함에서 Resend 메일 확인  

키가 없으면 앱은 알림만 스킵하고 DB 저장은 된다.

### R 체크

- [ ] Resend API Key 발급  
- [ ] Vercel에 `RESEND_*` (+ `NOTIFY_EMAILS`) 등록  
- [ ] Redeploy  
- [ ] Contact → Inbox + 메일 수신 확인  

---

## Track A — Tier A 콘텐츠

상세 스펙: [P5-content-guide.md](./P5-content-guide.md)  
체크리스트 원본: [P5-tier-a-checklist.md](./P5-tier-a-checklist.md)

### A0. 전제

- Production(또는 스테이징) Admin 로그인 가능  
- **사진 업로드 전 Track C 완료 권장** (아니면 로컬 디스크에만 쌓임 → Vercel에서 유실)  
- SuperAdmin 시드는 이미 있다면 비밀번호만 운영 정책에 맞게 유지/변경  

### A1. Settings (`/admin/settings`)

| key | 할 일 |
|---|---|
| `stats.members` / `cities` / `countries` | 본부 공식값 또는 플레이스홀더 유지 **합의** |
| `contact.email` | 실주소 또는 플레이스홀더 합의 |
| `contact.sla` | 예: `3~5일` |
| `social.linkedin` | 챕터 URL 또는 비움(코드가 공식 URL로 폴백 가능) |
| `meetup.ctaUrl` | Luma 등 외부 URL 또는 `/contact` |

- [ ] Settings 7키 반영  

### A2. People (`/admin/people`)

| 항목 | 기준 |
|---|---|
| 인원 | 최소 **6**, 목표 **12~13** (동의자) |
| 텍스트 | 한글명 / 영문명 / bio 20~28자 |
| 사진 | 3:4, 짧은 변 ≥900px, 초상권 동의 |
| 링크 | LinkedIn·웹 — 동의분만 |
| 순서 | DnD `sortOrder` |

- [ ] 공개 목록 등록·노출  
- [ ] `/ko/people` 스모크  

### A3. Archive 사진벽 (`/admin/meetups/archive`)

- [ ] 현장 사진 **8장+** (긴 변 ≥1200px)  
- [ ] 초상권·사용 동의  
- [ ] `/ko/meetups` 사진벽 스모크  

### A4. 원데이 클래스 1건+ (`/admin/meetups`)

- [ ] 제목 / 일자 / 인원 / 요약 · status=`published`  
- [ ] 후기 1~2  
- [ ] 현장 사진 1~3  
- [ ] `/ko/meetups` 클래스 섹션 스모크  

### A5. Insights (`/admin/insights`)

- [ ] Featured 1 (Meetup Recap 권장)  
- [ ] published 추가 **2편** (썸네일 선택)  
- [ ] 본문 TipTap HTML  
- [ ] `/ko/insights` · 상세 스모크  

---

## 완료 정의 · 트리거

세 Track 체크가 끝나면 채팅에 아래를 보낸다:

```text
Tier A 준비 완료
```

에이전트/운영 다음 단계 (G6b):

1. Production 최신 배포 확인  
2. (필요 시) `pnpm db:seed:prod` — SuperAdmin+Settings만 (데모 People/Insights 넣지 않음)  
3. 퍼블릭 5페이지 + Admin + Contact + 업로드 + (Resend) 알림 스모크  
4. G6b 검수 문서 작성  

### 통합 체크 (제출 전)

- [ ] Track C 완료 (또는 “이미지 리스크 인지하고 스킵” 명시 합의)  
- [ ] Track R 완료 (또는 “메일 없이 Inbox만” 합의)  
- [ ] Track A 전부 체크  
- [ ] 시크릿이 Git/채팅에 붙여넣기되지 않음  

---

## 빠른 참조 — env 블록

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=aic-seoul

# Resend
RESEND_API_KEY=
RESEND_FROM="AIC Seoul <onboarding@resend.dev>"
NOTIFY_EMAILS=
```

로컬 예시: `.env.example` · `.env.vercel.example`
