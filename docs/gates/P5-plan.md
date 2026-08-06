# G6 / P5 — MVP 출시 계획

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P5 계획 승인」 + 콘텐츠 적재 가이드 요청)
- 콘텐츠 가이드: [P5-content-guide.md](./P5-content-guide.md)
- 선행: G5b / P4 구현 `approved`
- 목적: **계획만** 확정. 승인 후 배포·런북 실행 → G6b 출시 검수

---

## 1. P5 목표

**방문자가 쓰는 공식 URL**에서 퍼블릭 5페이지 + Admin이 동작하는 MVP 공개.

| # | 산출물 | Done 기준 |
|---|---|---|
| 1 | 프로덕션 DB | 호스팅 Postgres (Neon/Supabase/Vercel Postgres 등) + migrate + seed(또는 최소 SuperAdmin) |
| 2 | Vercel 프로젝트 | `main`(또는 지정 브랜치) 자동 배포, Preview/Production |
| 3 | 프로덕션 env | AUTH/DB/SuperAdmin + (권장) Cloudinary·Resend |
| 4 | 스모크 QA | 퍼블릭·Admin·문의→Inbox·업로드 체크리스트 통과 |
| 5 | 런북 | 운영진 온보딩 1페이지 (가입→승인→모듈 권한) |
| 6 | 도메인 | **미확정이면** `*.vercel.app`로 공개 / 확정 시 DNS+AUTH_URL 교체 |

**P5에서 하지 않음:** Phase 2(카테고리 필터, 멤버 게시판, Hero CMS), 결제, 풀 i18n.

---

## 2. 인프라 선택 (권장안)

| 영역 | 권장 | 비고 |
|---|---|---|
| 호스팅 | **Vercel** | Next.js 정합 |
| DB | **Neon** 또는 **Vercel Postgres** | 서버리스 친화; 로컬 Docker와 분리 |
| 이미지 | **Cloudinary** (프로덕션 권장) | 서버리스 디스크 ephemeral → 로컬 uploads만으로는 부족 |
| 메일 | **Resend** | from 도메인 미확정이면 `onboarding@resend.dev` + 허용 수신 수신 |
| 저장소 | 현재 Git 원격 | push → Vercel 연동 |

승인 시 기본값: **Vercel + Neon + Cloudinary(가능하면) + Resend(가능하면)**.  
Cloudinary/Resend 계정 없으면: 로컬 업로드·알림 스킵으로도 “소프트 런치” 가능하되, **이미지 영속성은 제한**됨을 문서에 명시.

---

## 3. 환경변수 (Production)

필수:

```
DATABASE_URL=                 # 프로덕션 Postgres
AUTH_SECRET=                  # openssl rand -base64 32
AUTH_URL=                     # https://<prod-host>
SUPERADMIN_EMAILS=            # 실제 운영 이메일 최대 3
SUPERADMIN_SEED_PASSWORD=     # 최초 시드만, 배포 후 즉시 변경 권장
```

권장:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=aic-seoul
RESEND_API_KEY=
RESEND_FROM="AIC Seoul <onboarding@resend.dev>"
NOTIFY_EMAILS=                # 실운영진
```

Site Settings UI에서 `contact.email` / 통계 / LinkedIn도 실값으로 교체.

---

## 4. 배포 절차 (승인 후 실행 순서)

1. **원격 DB 생성** → `DATABASE_URL` 확보  
2. `prisma migrate deploy` (CI 또는 로컬에서 prod URL로)  
3. **시드 정책**  
   - A(권장): SuperAdmin만 시드, 콘텐츠는 Admin에서 등록  
   - B: 데모 시드 후 운영진이 교체  
4. **Vercel** 프로젝트 import · env 등록 · Root Directory = repo root  
5. Production 배포  
6. `AUTH_URL`을 실제 Production URL로 맞춘 뒤 재배포(필요 시)  
7. SuperAdmin 로그인 → `/admin/account`에서 비밀번호 변경 · 운영진 초대/승인  
8. 스모크 QA  
9. (도메인 확정 시) Vercel Domain + DNS → `AUTH_URL`·Resend 도메인 인증 업데이트  

도메인이 계속 미확정이면 **4–8만으로 MVP 공개**하고 G6b에 “vercel.app 소프트 런치”로 기록.

---

## 5. 스모크 QA 체크리스트

퍼블릭

- [ ] `/` 히어로·통계·CTA  
- [ ] `/meetups` 5단계·클래스·사진벽  
- [ ] `/people` 그리드  
- [ ] `/insights` Featured·상세·OG  
- [ ] `/contact` 제출 → Admin Inbox에 표시  
- [ ] `/sitemap.xml` · `/robots.txt`

Admin

- [ ] SuperAdmin 로그인  
- [ ] People DnD → 퍼블릭 반영  
- [ ] 이미지 업로드 (Cloudinary면 CDN URL)  
- [ ] Insights 발행  
- [ ] 문의 상태·CSV  
- [ ] Settings 저장  

보안

- [ ] `/admin` 미로그인 리다이렉트  
- [ ] pending 유저 콘솔 접근 불가  
- [ ] 시드 비밀번호 프로덕션 잔류 여부 확인  
- [ ] Contact honeypot + rate limit (반복 제출 시 제한 메시지)
- [ ] Admin 로그인 rate limit
- [ ] 응답 보안 헤더 (`X-Frame-Options`, `CSP` 등) — `curl -sI`
- [ ] 업로드 mime/size 거절
- [ ] (다음 단계) Turnstile/BotID, Redis rate limit, 커스텀 도메인 HSTS, CSP nonce, 플랫폼 대시보드 점검

---

## 6. 출시 커뮤니케이션 (제안)

- 운영진 12~13명: Admin 가입 링크 + “승인 대기” 안내  
- 대외: LinkedIn / 커뮤니티 채널에 Production URL  
- 문의 이메일은 플레이스홀더면 UI에 “확정 전” 유지 또는 Settings에서 실주소로 교체

---

## 7. 리스크

| 리스크 | 대응 |
|---|---|
| Cloudinary 없이 Vercel 업로드 | 재배포 시 `public/uploads` 유실 가능 → **Cloudinary 강력 권장** |
| Resend 미인증 도메인 | 테스트 from + NOTIFY_EMAILS만 Resend 허용 목록 |
| AUTH_URL 불일치 | 로그인 쿠키/콜백 깨짐 → 배포 후 URL 재확인 |
| 시드 데모 콘텐츠 | 소프트 런치 전 비노출/교체 |

---

## 8. 승인 시 바로 확인할 선택지

기본값으로 진행해도 되면 「P5 계획 승인」만으로 충분합니다.

1. DB: **Neon** / Vercel Postgres / 기타(직접 지정)  
2. 시드: **A SuperAdmin만** / B 데모 콘텐츠 포함  
3. 공개 범위: **vercel.app 소프트 런치** / 도메인 확보 후 DNS까지 한 번에  
4. Cloudinary·Resend: **지금 계정 연동** / 나중에(제한 고지)

---

## 9. 승인 체크리스트

- [ ] Vercel + 호스팅 Postgres 출시에 동의  
- [ ] 도메인 미확정 시 vercel.app 소프트 런치 가능에 동의  
- [ ] 프로덕션 Cloudinary 권장(미사용 시 이미지 리스크) 인지  
- [ ] 승인 후 위 배포 절차 실행 → G6b 출시 검수에 동의  

**승인 문구:** `P5 계획 승인`  
**수정 시:** DB/시드/도메인 선택만 적어 주세요.
