import "dotenv/config";
import {
  ContentStatus,
  MeetupType,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER_EMAIL =
  process.env.CONTACT_EMAIL_PLACEHOLDER ?? "hello@aic-seoul.example";

async function seedSettings() {
  const settings: { key: string; value: string }[] = [
    { key: "stats.members", value: "250K+" },
    { key: "stats.cities", value: "200+" },
    { key: "stats.countries", value: "50+" },
    { key: "contact.email", value: PLACEHOLDER_EMAIL },
    { key: "contact.sla", value: "3~5일" },
    { key: "social.linkedin", value: "https://www.linkedin.com" },
    { key: "meetup.ctaUrl", value: "/contact" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }
}

async function seedSuperadmins() {
  const emails = (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3);

  const defaultPassword = process.env.SUPERADMIN_SEED_PASSWORD ?? "ChangeMeNow!1";
  const passwordHash = await hash(defaultPassword, 12);

  for (const email of emails) {
    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        name: "Super Admin",
        role: UserRole.superadmin,
        status: UserStatus.active,
        permPeople: true,
        permMeetups: true,
        permInsights: true,
        permContact: true,
        permSettings: true,
      },
      update: {
        role: UserRole.superadmin,
        status: UserStatus.active,
        permPeople: true,
        permMeetups: true,
        permInsights: true,
        permContact: true,
        permSettings: true,
      },
    });
    console.log(`Seeded superadmin: ${email}`);
  }

  if (emails.length === 0) {
    console.log("No SUPERADMIN_EMAILS set — skipped superadmin seed.");
  }
}

async function seedMembers() {
  const members = [
    {
      nameKr: "이정임",
      nameEn: "Jeongim Lee",
      bio: "AIC 서울 챕터를 시작했습니다",
      photoUrl: "/placeholders/p1.jpg",
      linkedinUrl: "https://www.linkedin.com/in/",
      websiteUrl: "https://www.theaic.org/",
      isFounder: true,
      sortOrder: 0,
    },
    {
      nameKr: "김도윤",
      nameEn: "Doyun Kim",
      bio: "모임에서 질문이 끊기지 않게",
      photoUrl: "/placeholders/p2.jpg",
      linkedinUrl: "https://www.linkedin.com/in/",
      sortOrder: 1,
    },
    {
      nameKr: "박서연",
      nameEn: "Seoyeon Park",
      bio: "기록을 남겨 대화를 이어갑니다",
      photoUrl: "/placeholders/p3.jpg",
      linkedinUrl: "https://www.linkedin.com/in/",
      websiteUrl: "https://example.com",
      sortOrder: 2,
    },
    {
      nameKr: "정하준",
      nameEn: "Hajun Jung",
      bio: "처음 오신 분을 맞이합니다",
      photoUrl: "/placeholders/p4.jpg",
      websiteUrl: "https://example.com",
      sortOrder: 3,
    },
    {
      nameKr: "최유진",
      nameEn: "Yujin Choi",
      bio: "클래스 운영을 챙깁니다",
      photoUrl: "/placeholders/p5.jpg",
      linkedinUrl: "https://www.linkedin.com/in/",
      websiteUrl: "https://example.com",
      sortOrder: 4,
    },
    {
      nameKr: "한지호",
      nameEn: "Jiho Han",
      bio: "현장의 변화를 나눕니다",
      photoUrl: "/placeholders/p6.jpg",
      linkedinUrl: "https://www.linkedin.com/in/",
      sortOrder: 5,
    },
    {
      nameKr: "오수빈",
      nameEn: "Subin Oh",
      bio: "파트너십을 연결합니다",
      photoUrl: "/placeholders/p7.jpg",
      websiteUrl: "https://example.com",
      sortOrder: 6,
    },
    {
      nameKr: "윤채원",
      nameEn: "Chaewon Yoon",
      bio: "콘텐츠로 배움을 확장합니다",
      photoUrl: "/placeholders/p8.jpg",
      linkedinUrl: "https://www.linkedin.com/in/",
      websiteUrl: "https://example.com",
      sortOrder: 7,
    },
  ];

  await prisma.member.deleteMany();
  await prisma.member.createMany({
    data: members.map((m) => ({
      ...m,
      isVisible: true,
    })),
  });
}

async function seedMeetupsAndPhotos() {
  await prisma.meetupPhoto.deleteMany();
  await prisma.archivePhoto.deleteMany();
  await prisma.meetup.deleteMany();

  const meetup = await prisma.meetup.create({
    data: {
      type: MeetupType.class,
      title: "프롬프트가 일이 되는 날",
      date: new Date("2026-05-17"),
      headcount: 24,
      summary:
        "실무에 바로 쓰는 프롬프트 설계와 팀 협업 패턴을 하루 동안 집중적으로 다뤘습니다.",
      testimonials: [
        "혼자 고민하던 질문을 같은 자리에서 나눠서 훨씬 선명해졌어요.",
        "다음 주 업무에 바로 적용해볼 체크리스트를 가져갑니다.",
      ],
      status: ContentStatus.published,
      photos: {
        create: [
          { imageUrl: "/placeholders/p9.jpg", sortOrder: 0 },
          { imageUrl: "/placeholders/p10.jpg", sortOrder: 1 },
        ],
      },
    },
  });

  const archive = [1, 2, 3, 4, 5, 6, 7, 8, 11, 12].map((n, i) => ({
    imageUrl: `/placeholders/p${n}.jpg`,
    meetupId: i % 3 === 0 ? meetup.id : null,
    createdAt: new Date(Date.now() - i * 86400000),
  }));

  await prisma.archivePhoto.createMany({ data: archive });
}

async function seedInsights() {
  await prisma.insightPost.deleteMany();

  const posts = [
    {
      title: "5월 정기 모임 기록: 질문이 일을 바꿨던 밤",
      category: "Meetup Recap",
      summary:
        "발제보다 토론이 길었던 모임. 참가자들이 남긴 질문과 현장 이야기를 정리했습니다.",
      body: "이번 모임에서는 ‘AI가 바꾸는 일의 경계’를 주제로 모였습니다.\n\n네트워킹 이후 발제, 그룹 토론, 공유, Q&A로 이어진 흐름 속에서 각자의 현장이 교차했습니다. 이 글은 그날의 질문과 남겨진 메모를 재구성한 기록입니다.",
      thumbnailUrl: "/placeholders/p11.jpg",
      author: "AIC Seoul",
      publishedAt: new Date("2026-05-20"),
      isFeatured: true,
      status: ContentStatus.published,
    },
    {
      title: "원데이 클래스 후기: 프롬프트가 일이 되는 날",
      category: "Class Note",
      summary: "하루 클래스에서 참가자들이 가져간 실무 체크리스트와 소감을 모았습니다.",
      body: "클래스는 도구 소개가 아니라 ‘내 업무에 붙이는 방법’에 초점을 맞췄습니다.",
      thumbnailUrl: "/placeholders/p12.jpg",
      author: "AIC Seoul",
      publishedAt: new Date("2026-05-18"),
      isFeatured: false,
      status: ContentStatus.published,
    },
    {
      title: "커뮤니티가 기록을 남기는 이유",
      category: "Community",
      summary: "대화는 사라지기 쉽습니다. 그래서 우리는 짧게라도 남깁니다.",
      body: "기록은 홍보가 아니라, 다음 대화의 출발점입니다.",
      thumbnailUrl: null,
      author: "AIC Seoul",
      publishedAt: new Date("2026-04-30"),
      isFeatured: false,
      status: ContentStatus.published,
    },
    {
      title: "처음 오신 분을 위한 서울 챕터 안내",
      category: "Community",
      summary: "직군과 숙련도에 상관없이, 같은 질문을 들고 오면 충분합니다.",
      body: "모임 전후 흐름과 참여 방식을 짧게 정리했습니다.",
      thumbnailUrl: null,
      author: "AIC Seoul",
      publishedAt: new Date("2026-04-12"),
      isFeatured: false,
      status: ContentStatus.published,
    },
    {
      title: "4월 모임에서 남긴 세 가지 질문",
      category: "Meetup Recap",
      summary: "기술이 아니라 일하는 방식에 대한 질문이 더 많았습니다.",
      body: "질문 목록과 토론에서 반복된 키워드를 정리합니다.",
      thumbnailUrl: "/placeholders/p5.jpg",
      author: "AIC Seoul",
      publishedAt: new Date("2026-04-22"),
      isFeatured: false,
      status: ContentStatus.published,
    },
  ];

  for (const post of posts) {
    await prisma.insightPost.create({ data: post });
  }
}

async function main() {
  await seedSettings();
  await seedSuperadmins();
  await seedMembers();
  await seedMeetupsAndPhotos();
  await seedInsights();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
