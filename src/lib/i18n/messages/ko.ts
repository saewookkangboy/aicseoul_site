export type Messages = {
  home: {
    kicker: string;
    headline: string;
    subheadline: string;
    body: readonly string[];
    aux: readonly string[];
    globalTitle: string;
    globalBody: readonly string[];
    stats: { members: string; cities: string; countries: string };
    whyEyebrow: string;
    whyTitle: string;
    whyLead: readonly string[];
    whyBody: readonly string[];
    reasons: readonly { title: string; body: readonly string[] }[];
    whatEyebrow: string;
    whatTitle: string;
    whatLead: readonly string[];
    activities: readonly {
      tag: string;
      title: string;
      body: readonly string[];
      href: string;
      cta: string;
    }[];
    peopleTitle: string;
    peopleBody: readonly string[];
    peopleCta: string;
    partnerEyebrow: string;
    partnerTitle: string;
    partnerBody: readonly string[];
    partnerCta: string;
    finalTitle: string;
    finalBody: readonly string[];
    ctaMeetups: string;
    ctaContact: string;
    ctaLinkedin: string;
  };
  meetups: {
    title: string;
    intro: string;
    monthlyTitle: string;
    monthlyLead: string;
    steps: readonly string[];
    applyCta: string;
    classTitle: string;
    classLead: string;
    pastClassLabel: string;
    headcountSuffix: string;
    classInquiryCta: string;
    noClass: string;
    archiveTitle: string;
    noPhotos: string;
  };
  people: {
    title: string;
    lead: string;
  };
  insights: {
    title: string;
    lead: string;
    loadMore: string;
  };
  contact: {
    title: string;
    lead: string;
    types: readonly { title: string; body: string }[];
    orEmail: string;
    formTitle: string;
    formSla: string;
    form: {
      legend: string;
      types: readonly { value: string; label: string }[];
      name: string;
      org: string;
      email: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successBody: string;
    };
  };
  footer: {
    tagline: string;
  };
  seo: {
    homeDescription: string;
    meetupsDescription: string;
    peopleDescription: string;
    insightsDescription: string;
    contactDescription: string;
  };
};

export const ko: Messages = {
  home: {
    kicker: "The AI Collective · Seoul Chapter",
    headline: "AI 시대, 좋은 질문은 대화에서 나옵니다.",
    subheadline: "In the AI era, better questions come from conversation.",
    body: [
      "The AI Collective Seoul Chapter는 AI를 혼자 따라가지 않아도 되는 커뮤니티입니다.",
      "우리는 매달 서울에서 모여 AI가 바꾸는 일과 커리어, 조직과 사회의 변화를 함께 이야기하고, 서로의 경험에서 배웁니다.",
    ],
    aux: [
      "특별한 전문성이 없어도 괜찮습니다.",
      "같은 질문을 나눌 동료가 있으면 충분합니다.",
    ],
    globalTitle: "The AI Collective의 서울 챕터",
    globalBody: [
      "The AI Collective는 전 세계 사람들이 AI를 함께 이야기하는 글로벌 커뮤니티입니다.",
      "AIC 서울 챕터는 그 네트워크의 일원으로, 서울에서 우리만의 대화를 만들어갑니다.",
    ],
    stats: { members: "멤버", cities: "도시", countries: "개국" },
    whyEyebrow: "Why we gather",
    whyTitle: "왜 지금, 우리는 모이는가",
    whyLead: [
      "AI 정보는 온라인에 넘칩니다.",
      "그런데도 우리가 굳이 얼굴을 맞대고 모이는 이유가 있습니다.",
    ],
    whyBody: [
      "AI가 바꾸는 일과 커리어, 조직과 사회의 변화는 혼자 읽어서 소화하기 어렵습니다.",
      "서로 다른 자리에서 일하는 사람들이 같은 질문을 들고 모일 때, 비로소 입체적인 이해가 만들어집니다.",
    ],
    reasons: [
      {
        title: "질문",
        body: [
          "기술은 빠르게 바뀌지만, 좋은 질문은 저절로 생기지 않습니다.",
          "무엇을 배우고, 지키고, 새롭게 시도할지 함께 묻습니다.",
        ],
      },
      {
        title: "현장",
        body: [
          "AI의 변화는 먼 미래가 아닙니다.",
          "이미 업무와 의사결정에 들어와 있습니다.",
          "각자의 현장에서 겪은 변화를 나눕니다.",
        ],
      },
      {
        title: "실험",
        body: [
          "대화는 듣고 끝나지 않습니다.",
          "모임에서 받은 자극을 일에서 시도합니다.",
          "그 경험을 다시 가져옵니다.",
        ],
      },
    ],
    whatEyebrow: "What we do",
    whatTitle: "AIC 서울 챕터에서는 무엇을 하나요",
    whatLead: [
      "AIC 서울 챕터는 정기 오프라인 모임을 중심으로 운영됩니다.",
      "발표만 듣고 헤어지는 자리가 아니라, 함께 묻고, 대화하고, 실험하는 시간을 지향합니다.",
    ],
    activities: [
      {
        tag: "Monthly Meetup",
        title: "정기 모임",
        body: [
          "매달 서울에서 열리는 오프라인 모임입니다.",
          "하나의 주제를 전문가 발제와 그룹 토론으로 함께 해석합니다.",
        ],
        href: "/meetups",
        cta: "다음 모임 보기 →",
      },
      {
        tag: "One-day Class",
        title: "원데이 클래스",
        body: [
          "AI를 자기 일에 적용하고 싶은 분을 위한 집중형 교육 프로그램입니다.",
          "모임의 대화를 더 깊은 배움으로 잇습니다.",
        ],
        href: "/meetups",
        cta: "지난 클래스 살펴보기 →",
      },
      {
        tag: "Team & Corporate",
        title: "소규모·기업 교육",
        body: [
          "팀·조직 단위 AI 교육이나 AX 전환이 필요할 때,",
          "맞춤형 교육을 함께 설계합니다.",
        ],
        href: "/contact",
        cta: "문의하기 →",
      },
    ],
    peopleTitle: "AIC 서울 챕터를 함께 만드는 사람들",
    peopleBody: [
      "AIC 서울 챕터의 운영진은 관리자가 아니라 가장 먼저 움직이는 멤버입니다.",
      "누군가는 커뮤니티의 방향을 설계하고, 누군가는 대화가 사라지지 않도록 기록하고, 누군가는 처음 온 사람을 맞이합니다.",
      "그리고 우리 모두, AI 앞에서는 함께 배우는 사람입니다.",
    ],
    peopleCta: "운영진 만나보기 →",
    partnerEyebrow: "Partner",
    partnerTitle: "함께할 파트너를 기다립니다",
    partnerBody: [
      "AIC 서울 챕터는 커뮤니티의 배움과 연결에 기여하는 협업을 우선합니다.",
      "공동 세션, 콘텐츠 협업, 공간 파트너십부터 커뮤니티를 지원하는 후원까지, 다양한 방식으로 AI 시대의 의미 있는 대화를 함께 만들 수 있습니다.",
    ],
    partnerCta: "파트너십 문의하기",
    finalTitle: "서울에서 이어지는 다음 대화에 함께하세요",
    finalBody: [
      "AI 시대를 혼자 따라갈 필요는 없습니다.",
      "함께 묻고, 이야기하고, 배울 사람들이 서울에 있습니다.",
    ],
    ctaMeetups: "다음 모임 보기",
    ctaContact: "문의하기",
    ctaLinkedin: "링크드인 팔로우",
  },
  meetups: {
    title: "AIC 서울 챕터의 모임",
    intro:
      "AIC 서울 챕터는 두 가지 방식으로 모입니다. 매달 이어지는 정기 모임에서 함께 질문을 나누고, 원데이 클래스에서 한 걸음 더 깊이 배웁니다.",
    monthlyTitle: "정기 모임",
    monthlyLead:
      "매달 서울에서 열리는 오프라인 모임입니다. 하나의 주제를 정해, 전문가 발제와 그룹 토론으로 AI 시대의 변화를 함께 해석합니다. 발표만 듣고 헤어지는 자리가 아니라, 모두가 말하고 듣고 나누는 시간을 지향합니다.",
    steps: ["네트워킹", "주제 발표", "그룹 토론", "그룹 공유", "전체 Q&A"],
    applyCta: "다음 모임 신청하기 →",
    classTitle: "원데이 클래스",
    classLead:
      "AI를 자기 일에 적용하고 싶은 분을 위한 집중형 교육 프로그램입니다. 정기 모임이 넓게 질문을 나누는 자리라면, 원데이 클래스는 하나의 주제를 깊이 있게 배우고 익히는 자리입니다.",
    pastClassLabel: "지난 클래스 · 기록",
    headcountSuffix: "명",
    classInquiryCta: "다음 클래스 문의하기 →",
    noClass: "아직 등록된 클래스 기록이 없습니다.",
    archiveTitle: "지난 모임의 순간들",
    noPhotos: "사진이 아직 없습니다.",
  },
  people: {
    title: "함께 만드는 사람들",
    lead: "AIC 서울 챕터의 운영진은 가장 먼저 움직이는 멤버입니다. 역할 라벨 없이, 사람 그 자체로 소개합니다.",
  },
  insights: {
    title: "기록과 배움",
    lead: "대화는 사라지기 쉽습니다. 그래서 모임과 클래스의 배움을 짧게라도 남깁니다.",
    loadMore: "더 보기",
  },
  contact: {
    title: "문의하기",
    lead: "협업·후원, 교육, 커뮤니티 참여 — 무엇이든 아래 폼으로 문의해 주세요.",
    types: [
      {
        title: "협업 · 후원",
        body: "공동 세션, 콘텐츠 협업, 공간 파트너십, 커뮤니티를 지원하는 후원까지.",
      },
      {
        title: "교육 문의",
        body: "팀·조직 단위 AI 교육이나 AX 전환이 필요하다면 맞춤형 프로그램을 함께 설계합니다.",
      },
      {
        title: "커뮤니티 참여 · 일반",
        body: "모임 참여, 운영 관련 질문, 그 밖의 이야기를 남겨 주세요.",
      },
    ],
    orEmail: "또는 이메일로 직접:",
    formTitle: "문의 남기기",
    formSla: "보통 {sla} 안에 답장드립니다.",
    form: {
      legend: "어떤 문의인가요?",
      types: [
        { value: "partnership", label: "협업 · 후원" },
        { value: "education", label: "교육 문의" },
        { value: "community", label: "커뮤니티 참여" },
        { value: "other", label: "기타" },
      ],
      name: "이름",
      org: "소속 (선택)",
      email: "이메일",
      message: "내용",
      messagePlaceholder: "문의 내용을 자유롭게 적어주세요.",
      submit: "문의 보내기",
      submitting: "보내는 중…",
      successTitle: "문의가 접수되었습니다",
      successBody: "보통 {sla} 안에 답장드립니다. 남겨 주신 이메일로 연락드릴게요.",
    },
  },
  footer: {
    tagline: "AI 시대를 혼자 따라가지 않아도 되는 커뮤니티",
  },
  seo: {
    homeDescription:
      "AI 시대, 좋은 질문은 대화에서 나옵니다. AIC 서울 챕터 공식 사이트.",
    meetupsDescription:
      "AIC 서울 챕터의 정기 모임과 원데이 클래스, 지난 순간의 기록.",
    peopleDescription: "AIC 서울 챕터를 함께 만드는 사람들.",
    insightsDescription: "모임 기록, 클래스 노트, 커뮤니티 이야기를 남깁니다.",
    contactDescription: "협업·후원, 교육, 커뮤니티 참여 문의.",
  },
};
