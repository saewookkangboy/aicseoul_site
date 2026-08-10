export type PeopleRoleCopy = {
  title: string;
  lead: string;
  body: string;
};

export type PeopleIntroCopy = {
  manifesto: string[];
  roles: PeopleRoleCopy[];
  bridge: string;
  closing: string;
};

export const PEOPLE_INTRO_SETTING_KEY = "people.introJson";

/** PPT「AIC 서울 운영진 소개」기반 기본 카피 (Admin에서 수정 가능). */
export const DEFAULT_PEOPLE_INTRO: PeopleIntroCopy = {
  manifesto: [
    "우리는 이 공간을 관리하는 사람들이 아닙니다.",
    "가장 먼저 움직이는 멤버입니다.",
    "AI 앞에서는 우리 모두 같이 배우는 사람입니다.",
    "운영진도 똑같이 배우고, 실패하고, 공유합니다.",
  ],
  roles: [
    {
      title: "전략",
      lead: "커뮤니티의 방향과 존재 이유를 설계합니다",
      body: "우리가 왜 모이는지 함께 답을 찾습니다",
    },
    {
      title: "기술 · 자동화",
      lead: "나눈 대화와 지식이 사라지지 않도록 구조를 만듭니다",
      body: "오늘의 대화가 내일의 자산이 됩니다",
    },
    {
      title: "브랜딩 · 콘텐츠",
      lead: "AIC의 활동이 바깥 세계와 연결되도록 합니다",
      body: "참여가 커리어로 이어지도록 꾸준한 흔적을 남깁니다",
    },
    {
      title: "경험 · 온보딩",
      lead: "누구도 처음부터 어색하지 않도록 맞이합니다",
      body: "첫날부터 연결되는 자리를 만듭니다",
    },
  ],
  bridge: "그리고 이 역할을 맡은 사람들을 소개합니다.",
  closing: "운영 방향은 항상 열려 있고, 누구든 기여할 수 있습니다.",
};

function isRole(v: unknown): v is PeopleRoleCopy {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.title === "string" &&
    typeof r.lead === "string" &&
    typeof r.body === "string"
  );
}

export function parsePeopleIntroJson(raw?: string | null): PeopleIntroCopy {
  if (!raw?.trim()) return DEFAULT_PEOPLE_INTRO;
  try {
    const data = JSON.parse(raw) as Partial<PeopleIntroCopy>;
    const manifesto = Array.isArray(data.manifesto)
      ? data.manifesto.filter((x): x is string => typeof x === "string")
      : DEFAULT_PEOPLE_INTRO.manifesto;
    const roles = Array.isArray(data.roles)
      ? data.roles.filter(isRole)
      : DEFAULT_PEOPLE_INTRO.roles;
    return {
      manifesto: manifesto.length > 0 ? manifesto : DEFAULT_PEOPLE_INTRO.manifesto,
      roles: roles.length > 0 ? roles : DEFAULT_PEOPLE_INTRO.roles,
      bridge:
        typeof data.bridge === "string" && data.bridge.trim()
          ? data.bridge
          : DEFAULT_PEOPLE_INTRO.bridge,
      closing:
        typeof data.closing === "string" && data.closing.trim()
          ? data.closing
          : DEFAULT_PEOPLE_INTRO.closing,
    };
  } catch {
    return DEFAULT_PEOPLE_INTRO;
  }
}

export function serializePeopleIntro(copy: PeopleIntroCopy): string {
  return JSON.stringify(copy);
}
