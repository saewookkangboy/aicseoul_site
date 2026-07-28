# G0 / P0 — 착수 결정 확정

- 문서 버전: v1.0
- 작성일: 2026-07-28
- 상태: **approved** (2026-07-28 사용자 「P0 승인」)
- 근거: PRD.md + 2026-07-28 사용자 지시

---

## 1. P0에서 확정한 항목

### 1.1 도메인
| 항목 | 결정 |
|---|---|
| 커스텀 도메인 | **미확정** — 출시 전까지 플레이스홀더/Vercel 기본 URL로 진행 |
| DNS·SSL | P5 출시 게이트에서 재오픈 |

### 1.2 문의 채널
| 항목 | 결정 |
|---|---|
| 공식 문의 이메일 | **가상 플레이스홀더** (예: `hello@aic-seoul.example`) — UI에 노출하되 “확정 전” 취급 |
| Contact 폼 저장 | DB 저장은 구현 (Admin Inbox) |
| 운영진 알림 메일 | 플레이스홀더 수신처로 두거나, 환경변수로 비워 두고 로컬/스테이징에서는 로그 대체 가능 |
| 실주소 교체 | 도메인 확정 시 Site Settings / env로 일괄 교체 |

### 1.3 Admin · 권한 모델 (PRD 6.1 대체)

PRD의 “MVP 단일 Admin” 대신 **아래 모델로 확정**:

| 항목 | 결정 |
|---|---|
| 가입 | **전체 운영진 회원가입** (이메일 + 비밀번호) |
| 로그인 | 가입 시 등록한 이메일·비밀번호 |
| 최상위 Admin | **계정 3명** — 하위 운영진 권한 설정 가능 |
| 하위 운영진 | 최상위 Admin이 부여한 권한 범위 내에서만 콘텐츠/문의 관리 |
| 권한 UI | Admin 화면에서 멤버별 권한 토글/역할 지정 (상세 스키마는 P1/P3 계획에서 구체화) |

#### 권한 모델 스케치 (구현은 승인 후)

```
SuperAdmin (최대 3명, 시드/초대)
  └─ 운영진 계정 승인·비활성
  └─ 역할/권한 부여 (예: people, meetups, insights, contact, settings)
Operator (회원가입 후 SuperAdmin 승인 또는 권한 부여 대기)
  └─ 부여된 모듈만 CRUD
```

> 보안 노트: 공개 회원가입이 바로 전체 Admin이 되면 안 됨.  
> **가입 → (대기) → SuperAdmin 승인/권한 부여 → 접근** 흐름을 기본으로 한다.  
> (세부: 초대 링크 vs 공개 가입+승인 — G1에서 선택안 제시)

### 1.4 디자인 팔레트 · 톤
| 항목 | 결정 |
|---|---|
| 컬러 기준 | **PRD 7장 AIC 글로벌 토큰**으로 우선 진행 |
| 적용 스킬 | [taste-skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`) 반영 |
| 목적 | 템플릿/슬롭 느낌 배제, 사람이 디자인한 에디토리얼·커뮤니티 톤 |

#### Design Read (taste-skill §0)
> Reading this as: **community chapter marketing site** for AI-curious professionals & partners, with an **editorial / warm-stone + champagne-gold language** aligned to aicollective.com, leaning toward **Next.js + Tailwind tokens + restrained motion** (not AI-purple, not cream-terracotta cliché beyond brand-locked stone).

#### Dials (제안, G1에서 재확인 가능)
| Dial | 값 | 이유 |
|---|---|---|
| DESIGN_VARIANCE | **6** | 커뮤니티·신뢰 우선, 과도한 비대칭 지양 |
| MOTION_INTENSITY | **5** | 히어로·스크롤 진입 정도, 시네마틱 과다 금지 |
| VISUAL_DENSITY | **3** | 히어로 예산·여백 중시 (PRD/프론트엔드 디자인 규칙) |

#### PRD 잠금 토큰 (변경 시 별도 승인)
| 토큰 | 값 |
|---|---|
| Stone BG | `#F5F5F3` |
| Ink | `#262220` |
| Card/Surface | `#FAFAF9` |
| Border | `#E7E5E4` |
| Champagne Gold | `#C7A77E` |
| Cream | `#EEE9DF` |
| Vivid Orange (CTA) | `#FF640D` |
| Dark BG | `#0F0C0A` |
| Type | 국문 Gothic A1 + 영문/숫자 Space Grotesk (PRD 7.3) |

### 1.5 CTA / 모임 신청 (이번 P0에서 기본값)
| 항목 | 임시 결정 (나중에 교체 가능) |
|---|---|
| 정기 모임 신청 CTA | Contact 또는 외부 URL 필드로 Admin 관리 — **초기값은 Contact 라우팅** |
| Insights 카테고리 필터 UI | MVP 미노출 (PRD 유지) |

---

## 2. 이번 게이트에서 승인받는 범위

승인 시 다음이 **확정**된다:

1. 도메인·실문의메일 미확정 상태로도 P1 착수 가능
2. Admin = 회원가입 + 이메일/비번 로그인 + SuperAdmin 3명 권한관리
3. 디자인 = PRD 팔레트 + taste-skill 적용
4. 이후 단계는 **계획 제시 → 승인 → 구현 → 검수** 게이트를 따른다

---

## 3. 의도적으로 열어 둔 항목 (G1에서 선택)

- [ ] 회원가입: 공개 가입+승인 vs 초대 전용
- [ ] SuperAdmin 3명 초기 시드 방법 (env 이메일 화이트리스트 / 마이그레이션)
- [ ] 권한 단위: 모듈 플래그 vs 역할(Editor 등) 프리셋
- [ ] 이미지 스토리지: Cloudinary vs S3
- [ ] ORM: Prisma vs Drizzle

---

## 4. Out of scope (변경 없음)

- 멤버 참여형 게시판/댓글
- 결제·티켓팅
- 풀 i18n (Home 한·영 병기만)
- 커스텀 도메인 구매·DNS

---

## 5. 승인 체크리스트 (검수용)

- [ ] 도메인 미확정·문의 플레이스홀더 진행에 동의
- [ ] Admin 권한 모델(가입 / 로그인 / SuperAdmin 3명)에 동의
- [ ] PRD 팔레트 + taste-skill 디자인 방향에 동의
- [ ] 게이트 방식(단계별 승인)에 동의

**승인 문구 예시:** `P0 승인`  
**수정 시:** 변경점을 채팅으로 알려주시면 이 문서를 갱신한 뒤 재검수합니다.
