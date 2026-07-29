import type { Messages } from "./ko";

export const en: Messages = {
  home: {
    kicker: "The AI Collective · Seoul Chapter",
    headline: "In the AI era, better questions come from conversation.",
    subheadline: "AI 시대, 좋은 질문은 대화에서 나옵니다.",
    body: [
      "The AI Collective Seoul Chapter is a community where you don’t have to chase AI alone.",
      "Each month in Seoul, we gather to talk about how AI is changing work, careers, organizations, and society — and learn from one another’s experience.",
    ],
    aux: [
      "You don’t need special expertise.",
      "Having peers who share the same questions is enough.",
    ],
    globalTitle: "The Seoul chapter of The AI Collective",
    globalBody: [
      "The AI Collective is a global community where people talk about AI together.",
      "As part of that network, AIC Seoul builds our own conversations here in the city.",
    ],
    stats: { members: "Members", cities: "Cities", countries: "Countries" },
    whyEyebrow: "Why we gather",
    whyTitle: "Why we meet, now",
    whyLead: [
      "AI information floods the internet.",
      "Still, we choose to meet face to face.",
    ],
    whyBody: [
      "How AI reshapes work, careers, organizations, and society is hard to absorb alone.",
      "When people from different seats bring the same questions, understanding becomes three-dimensional.",
    ],
    reasons: [
      {
        title: "Questions",
        body: [
          "Technology moves fast, but good questions don’t appear on their own.",
          "Together we ask what to learn, protect, and try next.",
        ],
      },
      {
        title: "Practice",
        body: [
          "AI change is not a distant future.",
          "It’s already in our work and decisions.",
          "We share what each of us sees in the field.",
        ],
      },
      {
        title: "Experiments",
        body: [
          "Conversation doesn’t end with listening.",
          "We take sparks from the meetup into our work,",
          "and bring the results back.",
        ],
      },
    ],
    whatEyebrow: "What we do",
    whatTitle: "What happens at AIC Seoul",
    whatLead: [
      "AIC Seoul centers on regular offline gatherings.",
      "Not just talks and goodbye — we ask, converse, and experiment together.",
    ],
    activities: [
      {
        tag: "Monthly Meetup",
        title: "Monthly meetup",
        body: [
          "An offline gathering in Seoul each month.",
          "We unpack one theme through expert talks and group discussion.",
        ],
        href: "/meetups",
        cta: "See the next meetup →",
      },
      {
        tag: "One-day Class",
        title: "One-day class",
        body: [
          "Focused learning for applying AI to your own work.",
          "It deepens the conversations from our meetups.",
        ],
        href: "/meetups",
        cta: "Browse past classes →",
      },
      {
        tag: "Team & Corporate",
        title: "Team & corporate learning",
        body: [
          "When teams need AI education or AX transformation,",
          "we design tailored programs together.",
        ],
        href: "/contact",
        cta: "Get in touch →",
      },
    ],
    peopleTitle: "The people building AIC Seoul",
    peopleBody: [
      "Our organizers aren’t administrators — they’re members who move first.",
      "Some shape direction, some keep conversations from vanishing, some welcome first-timers.",
      "And all of us are learners together in front of AI.",
    ],
    peopleCta: "Meet the organizers →",
    partnerEyebrow: "Partner",
    partnerTitle: "Partners welcome",
    partnerBody: [
      "AIC Seoul prioritizes collaborations that support learning and connection.",
      "From co-sessions and content to venues and sponsorship, we can build meaningful AI-era conversations together.",
    ],
    partnerCta: "Partnership inquiry",
    finalTitle: "Join the next conversation in Seoul",
    finalBody: [
      "You don’t have to keep up with the AI era alone.",
      "People to ask, talk, and learn with are here in Seoul.",
    ],
    ctaMeetups: "See the next meetup",
    ctaContact: "Contact",
    ctaLinkedin: "Follow on LinkedIn",
  },
  meetups: {
    title: "Gatherings at AIC Seoul",
    intro:
      "AIC Seoul meets in two ways: monthly meetups to share questions, and one-day classes to go deeper.",
    monthlyTitle: "Monthly meetup",
    monthlyLead:
      "An offline gathering in Seoul each month. We pick one theme and explore AI-era change through expert talks and group discussion — not just listening and leaving, but speaking, hearing, and sharing together.",
    steps: [
      "Networking",
      "Talk",
      "Group discussion",
      "Group share",
      "Open Q&A",
    ],
    applyCta: "Apply for the next meetup →",
    classTitle: "One-day class",
    classLead:
      "Focused learning for applying AI to your work. If monthly meetups open questions broadly, one-day classes go deep on a single topic.",
    pastClassLabel: "Past class · notes",
    headcountSuffix: " people",
    classInquiryCta: "Ask about the next class →",
    noClass: "No class notes have been published yet.",
    archiveTitle: "Moments from past meetups",
    noPhotos: "No photos yet.",
  },
  people: {
    title: "People building together",
    lead: "AIC Seoul organizers are the members who move first. No role labels — just people.",
  },
  insights: {
    title: "Notes & learning",
    lead: "Conversations fade easily. So we leave short notes from meetups and classes.",
    loadMore: "Load more",
  },
  contact: {
    title: "Contact",
    lead: "Partnership, education, community — reach us with the form below.",
    types: [
      {
        title: "Partnership · sponsorship",
        body: "Co-sessions, content, venues, and support for the community.",
      },
      {
        title: "Education",
        body: "Team AI learning or AX transformation — we design programs together.",
      },
      {
        title: "Community · general",
        body: "Meetup attendance, operations questions, or anything else.",
      },
    ],
    orEmail: "Or email us directly:",
    formTitle: "Leave a message",
    formSla: "We usually reply within {sla}.",
    form: {
      legend: "What is this about?",
      types: [
        { value: "partnership", label: "Partnership · sponsorship" },
        { value: "education", label: "Education" },
        { value: "community", label: "Community" },
        { value: "other", label: "Other" },
      ],
      name: "Name",
      org: "Organization (optional)",
      email: "Email",
      message: "Message",
      messagePlaceholder: "Tell us what’s on your mind.",
      submit: "Send message",
      submitting: "Sending…",
      successTitle: "Message received",
      successBody:
        "We usually reply within {sla}. We’ll contact you at the email you left.",
    },
  },
  footer: {
    tagline: "A community where you don’t have to chase the AI era alone",
  },
  seo: {
    homeDescription:
      "In the AI era, better questions come from conversation. Official site of AIC Seoul.",
    meetupsDescription:
      "Monthly meetups, one-day classes, and moments from AIC Seoul.",
    peopleDescription: "The people building AIC Seoul together.",
    insightsDescription: "Meetup notes, class write-ups, and community stories.",
    contactDescription: "Partnership, education, and community inquiries.",
  },
};
