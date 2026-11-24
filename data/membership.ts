export type MembershipPageCopy = {
  category: "VFE_PRIVE" | "VFE_SELECT";
  heroImage: string;
  heroTitle: string;
  heroBody: string;
  sectionTitle: string;
  sectionSubtitle: string;
  sectionParagraphs: string[];
  ctaTitle: string;
  ctaBody: string;
  consultHref: string;
};

export const membershipIntro = {
  title: "Our Memberships",
  paragraphs: [
    "Every search is different. So is the level of access, guidance and personal involvement it may require.",
    "More than a decade of matchmaking has brought together a remarkable international community of individuals and families, connected by a shared intention to find a meaningful, lasting partnership.",
  ],
};

export const privePage: MembershipPageCopy = {
  category: "VFE_PRIVE",
  heroImage: "/images/membershipPriveFull.webp",
  heroTitle: "Vows For Eternity Privé",
  heroBody:
    "Our most exclusive matchmaking offering. Privé is created for individuals and families seeking an exceptional level of access, discretion and personal representation. Extending beyond our existing membership community, Privé brings together our most senior leadership, established international networks and a highly bespoke approach to finding a life partner.",
  sectionTitle: "Vows For Eternity Privé",
  sectionSubtitle: "A Private, Bespoke Matchmaking Engagement",
  sectionParagraphs: [
    "Vows for Eternity Privé is our most personalized matchmaking engagement, created for individuals and families whose search calls for greater discretion, wider access and the personal involvement of our senior leadership.",
    "Drawing on more than a decade of matchmaking experience in over 65 countries, we bring together an established international network, longstanding relationships and an understanding of the personal, cultural and family considerations that can make these searches particularly complex.",
    "Unlike Select, Privé extends beyond our existing membership community. Our Executive Team represents you discreetly, drawing on trusted relationships across geographies and communities to identify and pursue potential introductions.",
  ],
  ctaTitle: "Explore a Private Engagement",
  ctaBody: "Start with a conversation. Let us figure it out together.",
  consultHref: "/contact?membershipType=VFE_PRIVE",
};

export const selectPage: MembershipPageCopy = {
  category: "VFE_SELECT",
  heroImage: "/images/membershipSelectFull.webp",
  heroTitle: "Vows For Eternity Select",
  heroBody:
    "Vows for Eternity Select offers access to this established community, built over years of personal relationships, introductions and trust. It is a more private, considered way to search for a life partner, supported by the experience and perspective of a team that has spent years understanding the complexities of marriage and relationships across cultures.",
  sectionTitle: "Vows For Eternity Select",
  sectionSubtitle: "",
  sectionParagraphs: [],
  ctaTitle: "Not sure which fits?",
  ctaBody: "Start with a conversation. We will help you decide",
  consultHref: "/contact?membershipType=VFE_SELECT",
};

export const membershipChoices = [
  {
    href: "/membership/prive",
    image: "/images/membershipPrive.webp",
    title: privePage.heroTitle,
    body: privePage.heroBody,
    imagePosition: "object-center",
  },
  {
    href: "/membership/select",
    image: "/images/membershipSelect.webp",
    title: selectPage.heroTitle,
    body: selectPage.heroBody,
    imagePosition: "object-[center_30%]",
  },
];
